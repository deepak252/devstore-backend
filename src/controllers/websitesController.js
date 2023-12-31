const { Website } = require('../models');
const { paginateQuery } = require('../utils/mongoUtil');
const { success, handleError } = require('../utils/responseUtil');
const { jsonTryParse } = require('../utils/misc');
const {
  getIconsRemotePath,
  getVideosRemotePath,
  getImagesRemotePath,
} = require('../utils/storageUtil');
const Logger = require('../utils/logger');
const { removeFiles } = require('../utils/fileUtil');
const { uploadFileToStorage } = require('../helper/firebaseStorage');
const { BadRequestError } = require('../utils/errors');

const logger = new Logger('WebsitesController');

exports.getWebsites = async (req, res) => {
  try {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const filter = {};

    const websites = await paginateQuery(
      Website.find(filter),
      pageNumber,
      pageSize
    );
    const totalResults = await Website.countDocuments(filter);

    res.json(
      success(undefined, { websites, pageNumber, pageSize, totalResults })
    );
  } catch (e) {
    logger.error(e, 'getWebsites');
    return handleError(e, res);
  }
};

exports.getWebsiteById = async (req, res) => {
  try {
    res.json(success('Success'));
  } catch (e) {
    console.error('Error: getWebsiteById');
  }
};

exports.createWebsite = async (req, res) => {
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
    } = jsonTryParse(data);

    let website = new Website({
      name,
      description,
      categories,
      sourceCode,
      isSourceCodePublic,
      isPrivate,
      owner: userId,
    });

    let error = website.validateSync();
    if (error) {
      throw new BadRequestError(error.message);
    }
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
    website.set({
      file,
      apkInfo,
      ipaInfo,
      icon,
      images,
      video,
    });
    const result = await website.save();

    res.json(success('Website created successfully', result));
  } catch (e) {
    logger.error(e, 'createWebsite');
    return handleError(e, res);
  } finally {
    removeFiles([iconLocalPath, ...(imagesLocalPaths ?? []), videoLocalPath]);
  }
};
