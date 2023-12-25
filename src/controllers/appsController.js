const { App } = require('../models');
const { paginateQuery, isMongoId } = require('../utils/mongoUtil');
const { success, handleError } = require('../utils/responseUtil');
const Logger = require('../utils/logger');
const {
  removeFile,
  getApkInfo,
  getIpaInfo,
  removeFiles,
} = require('../utils/fileUtil');
const {
  uploadFileToStorage,
} = require('../helper/firebaseStorage');
const UploadApp = require('../models/UploadApp');
const { deleteUserUploadedAppsFromBin } = require('../helper/appsHelper');
const { BadRequestError } = require('../utils/errors');

const logger = new Logger('AppsController');

exports.getApps = async (req, res) => {
  try {
    const { pageSize = 2, pageNumber = 1 } = req.query;
    const filter = {};

    const apps = await paginateQuery(App.find(filter), pageNumber, pageSize);
    const totalResults = await App.countDocuments(filter);

    res.json(success(undefined, { apps, pageNumber, pageSize, totalResults }));
  } catch (e) {
    console.error('Error:getApps, ', e);
    return handleError(e, res);
  }
};

exports.getAppById = async (req, res) => {
  try {
    res.json(success('Success'));
  } catch (e) {
    console.error('Error: getAppById');
  }
};

const jsonTryParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

exports.createApp = async (req, res) => {
  let iconLocalPath, imagesLocalPaths, videoLocalPath;
  try {
    const { data } = req.body;
    const userId = req.user?._id;
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
    if(!uploadedApp){
      throw new BadRequestError("Application file not found. Please try again")
    }
    const { file, apkInfo, ipaInfo, isIos } = uploadedApp;
    const attachmentIcon = req.files?.attachmentIcon?.pop();
    const attachmentVideo = req.files?.attachmentVideo?.pop();
    const attachmentImages = req.files?.attachmentImages;

    iconLocalPath = attachmentIcon?.path;
    videoLocalPath = attachmentVideo?.path;
    imagesLocalPaths = attachmentImages?.map((file) => file.path);

    let icon,
      images = [],
      video;
    if (iconLocalPath) {
      const iconRemotePath = `icons/${attachmentIcon.filename}`;
      const iconUrl = await uploadFileToStorage(iconLocalPath, iconRemotePath);
      icon = {
        url: iconUrl,
        path: iconRemotePath,
      };
    }
    if (videoLocalPath) {
      const videoRemotePath = `videos/${attachmentVideo.filename}`;
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
        const imageRemotePath = `images/${attach.filename}`;
        const imageUrl = await uploadFileToStorage(
          attach?.path,
          imageRemotePath
        );
        images.push({
          url: imageUrl,
          path: imageRemotePath,
        });
      }
    }
    app.file = file;
    app.apkInfo = apkInfo;
    app.ipaInfo = ipaInfo;
    app.isIos = isIos;
    app.icon = icon;
    app.images = images;
    app.video = video;
    app.icon = icon;
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
    remotePath = `apps/${file.filename}`;

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
