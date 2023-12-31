const { App } = require('../models');
const { paginateQuery, isMongoId } = require('../utils/mongoUtil');
const { success, handleError } = require('../utils/responseUtil');
const { jsonTryParse } = require('../utils/misc');
const {
  getIconsRemotePath,
  getVideosRemotePath,
  getImagesRemotePath,
  getAppsRemotePath,
} = require('../utils/storageUtil');
const Logger = require('../utils/logger');
const {
  removeFile,
  getApkInfo,
  getIpaInfo,
  removeFiles,
} = require('../utils/fileUtil');
const { uploadFileToStorage } = require('../helper/firebaseStorage');
const UploadApp = require('../models/UploadApp');
const { deleteUserUploadedAppsFromBin } = require('../helper/appsHelper');
const { BadRequestError } = require('../utils/errors');
const { SELECTED_FIELDS, POPULATE_USER } = require('../config/queryFilters');

const logger = new Logger('AppsController');

exports.getApps = async (req, res) => {
  try {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const filter = { $or: [{ isPrivate: false }, { owner: req?.user?._id }] };
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

exports.getAppById = async (req, res) => {
  try {
    const { appId } = req.params;
    if (!isMongoId(appId)) {
      throw new BadRequestError('Invalid app ID');
    }
    let result = await App.findById(appId).populate(POPULATE_USER).lean();
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

exports.createApp = async (req, res) => {
  let iconLocalPath, videoLocalPath, imagesLocalPaths;
  let iconRemotePath,
    videoRemotePath,
    imagesRemotePaths = [];
  try {
    const {
      body: { data } = {},
      user: { _id: userId } = {},
      files: {
        attachmentIcon: [attachmentIcon] = [],
        attachmentVideo: [attachmentVideo] = [],
        attachmentImages,
      } = {},
    } = req;

    let {
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      uploadedAppId,
    } = jsonTryParse(data);

    let app = new App({
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      owner: userId,
    });

    let error = app.validateSync();
    if (error) {
      throw new BadRequestError(error.message);
    }
    const uploadedApp = await UploadApp.findOne({
      _id: uploadedAppId,
      user: userId,
    }).lean();
    if (!uploadedApp) {
      throw new BadRequestError('Application file not found. Please try again');
    }
    const { file, apkInfo, ipaInfo, isIos } = uploadedApp;

    iconLocalPath = attachmentIcon?.path;
    videoLocalPath = attachmentVideo?.path;
    imagesLocalPaths = attachmentImages?.map((file) => file.path);

    let icon,
      video,
      images = [];
    if (iconLocalPath) {
      iconRemotePath = getIconsRemotePath(attachmentIcon.filename);
      const iconUrl = await uploadFileToStorage(iconLocalPath, iconRemotePath);
      icon = {
        url: iconUrl,
        path: iconRemotePath,
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
        path: videoRemotePath,
      };
    }
    if (imagesLocalPaths) {
      for (attach of attachmentImages) {
        const imageRemotePath = getImagesRemotePath(attach.filename);
        const imageUrl = await uploadFileToStorage(
          attach?.path,
          imageRemotePath
        );
        if (typeof imageUrl === 'string') {
          images.push({
            url: imageUrl,
            path: imageRemotePath,
          });
        }
        imagesRemotePaths.push(imageRemotePath);
      }
    }
    app.set({
      file,
      apkInfo,
      ipaInfo,
      isIos,
      icon,
      images,
      video,
    });
    const result = await app.save();
    await UploadApp.deleteOne({ _id: uploadedAppId });

    res.json(success('App created successfully', result));
  } catch (e) {
    logger.error(e, 'createApp');
    return handleError(e, res);
  } finally {
    removeFiles([iconLocalPath, ...(imagesLocalPaths ?? []), videoLocalPath]);
  }
};

exports.uploadApp = async (req, res, next) => {
  let localPath, remotePath;
  try {
    const { file, user } = req;
    let { isIos } = req.body;
    isIos = isIos === 'true';
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
    if (isIos) {
      const {
        CFBundleShortVersionString: version,
        CFBundleIdentifier: identifier,
        MinimumOSVersion: minOSVersion,
      } = await getIpaInfo(localPath);
      ipaInfo = { version, identifier, minOSVersion };
    } else {
      const {
        versionName: version,
        package,
        usesSdk: { minSdkVersion, targetSdkVersion },
      } = await getApkInfo(localPath);
      apkInfo = { version, package, minSdkVersion, targetSdkVersion };
    }
    const downloadUrl = await uploadFileToStorage(localPath, remotePath);
    if (typeof downloadUrl !== 'string') {
      throw downloadUrl;
    }
    const uploadedApp = new UploadApp({
      user: user._id,
      isIos,
      apkInfo,
      ipaInfo,
      file: {
        url: downloadUrl,
        path: remotePath,
      },
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
