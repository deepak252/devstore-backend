const { Game } = require('../models');
const { paginateQuery } = require('../utils/mongoUtil');
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

const logger = new Logger('GamesController');

exports.getGames = async (req, res) => {
  try {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const filter = {};

    const games = await paginateQuery(Game.find(filter), pageNumber, pageSize);
    const totalResults = await Game.countDocuments(filter);

    res.json(success(undefined, { games, pageNumber, pageSize, totalResults }));
  } catch (e) {
    logger.error(e, 'getGames');
    return handleError(e, res);
  }
};

exports.getGameById = async (req, res) => {
  try {
    res.json(success('Success'));
  } catch (e) {
    console.error('Error: getGameById');
  }
};

exports.createGame = async (req, res) => {
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

    let game = new Game({
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      owner: userId,
    });

    let error = game.validateSync();
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
    game.set({
      file,
      apkInfo,
      ipaInfo,
      isIos,
      icon,
      images,
      video,
    });
    const result = await game.save();
    await UploadApp.deleteOne({ _id: uploadedAppId });

    res.json(success('Game created successfully', result));
  } catch (e) {
    logger.error(e, 'createGame');
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

    // Delete games from bin for current user
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
