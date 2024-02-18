/* eslint-disable */
import Project from '../models/project.model.js';
import AppPackage from '../models/appPackage.model.js';
import { deleteAppPackages } from '../helper/appsHelper.js';
import {
  uploadFileToStorage,
  deleteFilesFromStorage
} from '../helper/firebaseStorage.js';
import {
  removeFile,
  getApkInfo,
  getIpaInfo,
  removeFiles
} from '../utils/fileUtil.js';
import { jsonTryParse } from '../utils/misc.js';
import { isMongoId } from '../utils/mongoUtil.js';
import { handleError } from '../utils/responseUtil.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Logger from '../utils/logger.js';
import { SELECTED_FIELDS, POPULATE_OWNER } from '../config/queryFilters.js';
import { PLATFORM, PROJECT_TYPE, REMOTE_PATH } from '../constants.js';

const logger = new Logger('ProjectsController');

export const getProjects = async (req, res) => {
  try {
    let { limit, page, search = '' } = req.query;
    const projectType = req.projectType; // apps, websites, games
    // eslint-disable-next-line no-unused-vars
    let { platform, categories } = req.body;
    // let reqFilter = {};
    // if (Object.values(PLATFORM).includes(platform)) {
    //   reqFilter = { platform };
    // }
    if (isNaN(page) || isNaN(limit)) {
      page = 1;
      limit = 10;
    } else {
      page = Number(page);
      limit = Number(limit);
    }
    page = Math.floor(Math.max(1, page));
    limit = Math.floor(Math.max(1, limit));
    const { resultsPipeline, totalResultsPipeline } = projectListPipeline({
      projectType,
      search,
      page,
      limit
    });
    const [projects, totalResults] = await Promise.all([
      Project.aggregate(resultsPipeline()).exec(),
      Project.aggregate(totalResultsPipeline()).exec()
    ]);
    const totalPages = Math.ceil(
      (totalResults[0]?.totalResults ?? 0) / limit
    );

    res.json(
      new ApiResponse(undefined, { projects, page, limit, totalPages })
    );

    // let filter = {
    //   $and: [
    //     reqFilter,
    //     { $or: [{ isPrivate: false }, { owner: req?.user?._id }] },
    //     { name: { $regex: search.trim(), $options: 'i' } }
    //   ]
    // };
    // const apps = await paginateQuery(
    //   Project.find(filter).select(SELECTED_FIELDS),
    //   page,
    //   limit
    // );
    // const totalResults = await Project.countDocuments(filter);

    // res.json(
    //   new ApiResponse(undefined, { apps, page, limit, totalResults })
    // );
  } catch (e) {
    logger.error(e, 'getProjects');
    return handleError(e, res);
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectType = req.projectType; // apps, websites, games
    if (!isMongoId(projectId)) {
      throw new ApiError('Invalid project ID');
    }
    let result = await Project.findOne({_id: projectId, projectType })
      .populate(POPULATE_OWNER)
      .lean();
    if (!result) {
      throw new ApiError('Not found');
    }
    if (!result.owner?._id?.equals(req.user?._id)) {
      if (result.isPrivate) {
        throw new ApiError('Not found');
      }
      if (!result.isSourceCodePublic) {
        delete result.sourceCode;
      }
    }
    return res.json(new ApiResponse(undefined, result));
  } catch (e) {
    logger.error(e, 'getProjectById');
    return handleError(e, res);
  }
};

export const createProject = async (req, res) => {
  let iconLocalPath, videoLocalPath, imagesLocalPaths, graphicLocalpath;
  let iconRemotePath,
    videoRemotePath,
    imagesRemotePaths = [],
    graphicRemotePath;
  try {
    const {
      body: { data } = {},
      user: { _id: userId } = {},
      projectType,
      files: {
        attachmentIcon: [attachmentIcon] = [],
        attachmentVideo: [attachmentVideo] = [],
        attachmentGraphic: [attachmentGraphic] = [],
        attachmentImages
      } = {}
    } = req;

    let {
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      packageId,
      otherLinks
    } = jsonTryParse(data);

    let project = new Project({
      projectType,
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      owner: userId,
      otherLinks
    });

    let error = project.validateSync();
    if (error) {
      throw new ApiError(error.message);
    }
    let appPackage = {};
    if([PROJECT_TYPE.APPS, PROJECT_TYPE.GAMES].includes(projectType)){
      appPackage = await AppPackage.findOne({
        _id: packageId,
        owner: userId
      }).lean();
      if (!appPackage) {
        throw new ApiError('Application package not found. Please try again');
      }
    }
    
    const { packageFile, apkInfo, ipaInfo, platform } = appPackage;

    iconLocalPath = attachmentIcon?.path;
    videoLocalPath = attachmentVideo?.path;
    graphicLocalpath = attachmentGraphic?.path;
    imagesLocalPaths = attachmentImages?.map((file) => file.path);

    let icon,
      video,
      featureGraphic,
      images = [];
    if (iconLocalPath) {
      iconRemotePath = `${REMOTE_PATH.icons}/${attachmentIcon.filename}`;
      const iconUrl = await uploadFileToStorage(iconLocalPath, iconRemotePath);
      icon = {
        url: iconUrl,
        path: iconRemotePath
      };
    }
    if (videoLocalPath) {
      videoRemotePath = `${REMOTE_PATH.videos}/${attachmentVideo.filename}`;
      const videoUrl = await uploadFileToStorage(
        videoLocalPath,
        videoRemotePath
      );
      video = {
        url: videoUrl,
        path: videoRemotePath
      };
    }
    if (graphicLocalpath) {
      graphicRemotePath = `${REMOTE_PATH.images}/${attachmentGraphic.filename}`;
      const graphicUrl = await uploadFileToStorage(
        graphicLocalpath,
        graphicRemotePath
      );
      featureGraphic = {
        url: graphicUrl,
        path: graphicRemotePath
      };
    }
    if (imagesLocalPaths) {
      for (let attach of attachmentImages) {
        const imageRemotePath = `${REMOTE_PATH.images}/${attach.filename}`;
        const imageUrl = await uploadFileToStorage(
          attach?.path,
          imageRemotePath
        );
        if (typeof imageUrl === 'string') {
          images.push({
            url: imageUrl,
            path: imageRemotePath
          });
        }
        imagesRemotePaths.push(imageRemotePath);
      }
    }
    project.set({
      packageFile,
      apkInfo,
      ipaInfo,
      platform,
      icon,
      images,
      video,
      featureGraphic
    });
    const result = await project.save();
    if(packageId){
      await AppPackage.deleteOne({ _id: packageId });
    }
    res
      .status(201)
      .json(new ApiResponse('Project created successfully', result, 201));
  } catch (e) {
    logger.error(e, 'createProject');
    const deletedFiles = await deleteFilesFromStorage([
      iconRemotePath,
      videoRemotePath,
      graphicRemotePath,
      ...(imagesRemotePaths ?? [])
    ]);
    return handleError(e, res);
  } finally {
    removeFiles([
      iconLocalPath,
      videoLocalPath,
      graphicLocalpath,
      ...(imagesLocalPaths ?? [])
    ]);
  }
};

export const uploadPackage = async (req, res) => {
  let localPath, remotePath;
  try {
    const { file, user } = req;
    let { platform, projectType } = req.body;
    if (!Object.values(PLATFORM).includes(platform)) {
      throw new ApiError('Invalid Platform');
    }
    if (!Object.values(PROJECT_TYPE).includes(projectType)) {
      throw new ApiError('Package must be app or game');
    }
    if (!file?.path) {
      throw new ApiError('No file uploaded');
    }
    localPath = file.path;
    remotePath = `${REMOTE_PATH.apps}/${file.filename}`;

    // return res.json(
    //   new ApiResponse('File uploaded successfully', { _id: '123', isIos })
    // );

    // Delete apps from bin for current user
    await deleteAppPackages(user._id);

    let apkInfo, ipaInfo;
    if (platform === PLATFORM.IOS) {
      const {
        CFBundleShortVersionString: version,
        CFBundleIdentifier: identifier,
        MinimumOSVersion: minOSVersion
      } = await getIpaInfo(localPath);
      ipaInfo = { version, identifier, minOSVersion };
    } else if (platform === PLATFORM.ANDROID) {
      const {
        versionName: version,
        package: p,
        usesSdk: { minSdkVersion, targetSdkVersion }
      } = await getApkInfo(localPath);
      apkInfo = { version, package: p, minSdkVersion, targetSdkVersion };
    }
    const downloadUrl = await uploadFileToStorage(localPath, remotePath);
    if (typeof downloadUrl !== 'string') {
      throw downloadUrl;
    }
    const appPackage = new AppPackage({
      owner: user._id,
      projectType,
      platform,
      apkInfo,
      ipaInfo,
      packageFile: {
        url: downloadUrl,
        path: remotePath
      }
    });
    const result = await appPackage.save();
    res.json(new ApiResponse('File uploaded successfully', result));
  } catch (e) {
    logger.error(e, 'uploadPackage');
    return handleError(e, res);
  } finally {
    localPath && removeFile(localPath);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { _id: userId } = req.user;
    if (!isMongoId(projectId)) {
      throw new ApiError('Invalid projectId');
    }
    const result = await Project.findOneAndDelete({
      _id: projectId,
      owner: userId
    }).lean();
    if (!result) {
      throw new ApiError('No Project Found');
    }
    const { icon, video, featureGraphic, images = [], packageFile } = result;
    const imgPaths = images?.map((e) => e.path) ?? [];
    const paths = [
      icon?.path,
      video?.path,
      featureGraphic?.path,
      packageFile?.path,
      ...imgPaths
    ];
    // eslint-disable-next-line no-unused-vars
    const deletedFiles = await deleteFilesFromStorage(paths);
    return res.json(new ApiResponse('Project deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteProject');
    return handleError(e, res);
  }
};


const projectListPipeline = ({
  projectType = 'apps',
  page = 1,
  limit = 10,
  search = ''
}) => {
  const stages = [
    {
      $match: {
        projectType,
        isPrivate: false,
        name: { $regex: new RegExp(search, 'i') }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner'
      }
    },
    {
      $addFields: {
        packageFile: '$packageFile.url',
        icon: '$icon.url',
        featureGraphic: '$featureGraphic.url',
        owner: {
          $arrayElemAt: ['$owner', 0]
        }
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        icon: 1,
        categories: 1,
        platform: 1,
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatarUrl: 1
        }
      }
    }
  ];
  return {
    totalResultsPipeline: () => [
      ...stages,
      {
        $count: 'totalResults'
      }
    ],
    resultsPipeline: () => [
      ...stages,
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ]
  };
};
