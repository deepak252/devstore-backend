import App from '../models/App.js';
import UploadApp from '../models/UploadApp.js';
import { deleteUserUploadedAppsFromBin } from '../helper/appsHelper.js';
import {
  uploadFileToStorage,
  deleteFilesFromStorage
} from '../helper/firebaseStorage.js';
import {
  getIconsRemotePath,
  getVideosRemotePath,
  getImagesRemotePath,
  getAppsRemotePath
} from '../utils/storageUtil.js';
import {
  removeFile,
  getApkInfo,
  getIpaInfo,
  removeFiles
} from '../utils/fileUtil.js';
import { jsonTryParse } from '../utils/misc.js';
import { paginateQuery, isMongoId } from '../utils/mongoUtil.js';
import { success, handleError } from '../utils/responseUtil.js';
import { BadRequestError } from '../utils/errors.js';
import Logger from '../utils/logger.js';
import { SELECTED_FIELDS, POPULATE_OWNER } from '../config/queryFilters.js';
import { PLATFORM } from '../config/constants.js';

const logger = new Logger('AppsController');

export const getApps = async (req, res) => {
  try {
    const { pageSize = 10, pageNumber = 1, searchQuery = '' } = req.query;
    // eslint-disable-next-line no-unused-vars
    let { platform, categories } = req.body;
    let reqFilter = {};
    if (Object.values(PLATFORM).includes(platform)) {
      reqFilter = { platform };
    }
    let filter = {
      $and: [
        reqFilter,
        { $or: [{ isPrivate: false }, { owner: req?.user?._id }] },
        { name: { $regex: searchQuery.trim(), $options: 'i' } }
      ]
    };
    const apps = await paginateQuery(
      App.find(filter).select(SELECTED_FIELDS),
      pageNumber,
      pageSize
    );
    const totalResults = await App.countDocuments(filter);

    res.json(success(undefined, { apps, pageNumber, pageSize, totalResults }));
  } catch (e) {
    logger.error(e, 'getApps');
    return handleError(e, res);
  }
};

export const getAppById = async (req, res) => {
  try {
    const { appId } = req.params;
    if (!isMongoId(appId)) {
      throw new BadRequestError('Invalid app ID');
    }
    let result = await App.findById(appId).populate(POPULATE_OWNER).lean();
    if (!result) {
      throw new BadRequestError('App not found');
    }
    if (!result.owner?._id?.equals(req.user?._id)) {
      if (result.isPrivate) {
        throw new BadRequestError('App not found');
      }
      if (!result.isSourceCodePublic) {
        delete result.sourceCode;
      }
    }
    return res.json(success(undefined, result));
  } catch (e) {
    logger.error(e, 'getAppById');
    return handleError(e, res);
  }
};

export const createApp = async (req, res) => {
  let iconLocalPath, videoLocalPath, imagesLocalPaths, graphicLocalpath;
  let iconRemotePath,
    videoRemotePath,
    imagesRemotePaths = [],
    graphicRemotePath;
  try {
    const {
      body: { data } = {},
      user: { _id: userId } = {},
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
      uploadedAppId
    } = jsonTryParse(data);

    let app = new App({
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      owner: userId
    });

    let error = app.validateSync();
    if (error) {
      throw new BadRequestError(error.message);
    }
    const uploadedApp = await UploadApp.findOne({
      _id: uploadedAppId,
      user: userId
    }).lean();
    if (!uploadedApp) {
      throw new BadRequestError('Application file not found. Please try again');
    }
    const { file, apkInfo, ipaInfo, platform } = uploadedApp;

    iconLocalPath = attachmentIcon?.path;
    videoLocalPath = attachmentVideo?.path;
    graphicLocalpath = attachmentGraphic?.path;
    imagesLocalPaths = attachmentImages?.map((file) => file.path);

    let icon,
      video,
      featureGraphic,
      images = [];
    if (iconLocalPath) {
      iconRemotePath = getIconsRemotePath(attachmentIcon.filename);
      const iconUrl = await uploadFileToStorage(iconLocalPath, iconRemotePath);
      icon = {
        url: iconUrl,
        path: iconRemotePath
      };
    }
    if (videoLocalPath) {
      videoRemotePath = getVideosRemotePath(attachmentVideo.filename);
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
      graphicRemotePath = getImagesRemotePath(attachmentGraphic.filename);
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
        const imageRemotePath = getImagesRemotePath(attach.filename);
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
    app.set({
      file,
      apkInfo,
      ipaInfo,
      platform,
      icon,
      images,
      video,
      featureGraphic
    });
    const result = await app.save();
    await UploadApp.deleteOne({ _id: uploadedAppId });

    res.json(success('App created successfully', result));
  } catch (e) {
    logger.error(e, 'createApp');
    return handleError(e, res);
  } finally {
    removeFiles([
      iconLocalPath,
      ...(imagesLocalPaths ?? []),
      videoLocalPath,
      graphicLocalpath
    ]);
  }
};

export const uploadApp = async (req, res) => {
  let localPath, remotePath;
  try {
    const { file, user } = req;
    let { platform } = req.body;
    if (!Object.values(PLATFORM).includes(platform)) {
      throw new BadRequestError('Invalid Platform');
    }
    if (!file?.path) {
      throw new BadRequestError('No file uploaded');
    }
    localPath = file.path;
    remotePath = getAppsRemotePath(file.filename);

    // return res.json(
    //   success('File uploaded successfully', { _id: '123', isIos })
    // );

    // Delete apps from bin for current user
    await deleteUserUploadedAppsFromBin(user._id);

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
    const uploadedApp = new UploadApp({
      user: user._id,
      platform,
      apkInfo,
      ipaInfo,
      file: {
        url: downloadUrl,
        path: remotePath
      }
    });
    const result = await uploadedApp.save();
    res.json(success('File uploaded successfully', result));
  } catch (e) {
    logger.error(e, 'uploadApp');
    return handleError(e, res);
  } finally {
    localPath && removeFile(localPath);
  }
};

export const deleteApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const { _id: userId } = req.user;
    if (!isMongoId(appId)) {
      throw new BadRequestError('Invalid appId');
    }
    const result = await App.findOneAndDelete({
      _id: appId,
      owner: userId
    }).lean();
    if (!result) {
      throw new BadRequestError('No App Found');
    }
    const { icon, video, featureGraphic, images = [], file } = result;
    const imgPaths = images?.map((e) => e.path) ?? [];
    const paths = [
      icon?.path,
      video?.path,
      featureGraphic?.path,
      file?.path,
      ...imgPaths
    ];
    // eslint-disable-next-line no-unused-vars
    const deletedFiles = await deleteFilesFromStorage(paths);
    return res.json(success('App deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteApp');
    return handleError(e, res);
  }
};
