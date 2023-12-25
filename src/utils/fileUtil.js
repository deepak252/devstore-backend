const fs = require('fs');
const ApkReader = require('adbkit-apkreader');
var extract = require('ipa-extract-info');
const Logger = require('./logger');
const { BadRequestError } = require('./errors');
const logger = new Logger('fileUtil');

const getFileExtension = (filename = '') => {
  const split = filename.split('.');
  if (split && split.length > 1) {
    return split.pop();
  }
};

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error while removing file: ${filePath}`, err);
      // throw err;
    }
  });
};

const removeFiles = (filePaths) => {
  Array.isArray(filePaths) && filePaths.forEach((fp) => removeFile(fp));
};

const createDirectoryIfNotExists = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

const getApkInfo = async (path) => {
  try {
    const reader = await ApkReader.open(path);
    const apkInfo = await reader.readManifest();
    if (apkInfo) {
      return apkInfo;
    } else {
      throw { apkInfo };
    }
  } catch (e) {
    logger.error(e, 'getApkInfo');
    throw new BadRequestError('Error reading APK file');
  }
};

const getIpaInfo = async (path) => {
  try {
    var fd = fs.openSync(path, 'r');
    const ipaInfo = (await extract(fd))?.info;
    if (Array.isArray(ipaInfo)) {
      return ipaInfo[0];
    }
    throw { ipaInfo };
  } catch (e) {
    logger.error(e, 'getIpaInfo');
    throw new BadRequestError('Error reading IPA file');
  }
};

module.exports = {
  getFileExtension,
  removeFile,
  removeFiles,
  createDirectoryIfNotExists,
  getApkInfo,
  getIpaInfo,
};
