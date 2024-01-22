import fs from 'fs';
import ApkReader from 'adbkit-apkreader';
import ipaExtractInfo from 'ipa-extract-info';
import { ApiError } from './ApiError.js';
import Logger from './logger.js';

const logger = new Logger('fileUtil');

export const getFileExtension = (filename = '') => {
  const split = filename.split('.');
  if (split && split.length > 1) {
    return split.pop();
  }
};

export const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error while removing file: ${filePath}`, err);
      // throw err;
    }
  });
};

export const removeFiles = (filePaths) => {
  Array.isArray(filePaths) && filePaths.forEach((fp) => removeFile(fp));
};

export const createDirectoryIfNotExists = (path) => {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  } catch (e) {
    logger.error(e, 'createDirectoryIfNotExists');
  }
};

export const getApkInfo = async (path) => {
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
    throw new ApiError('Error reading APK file');
  }
};

export const getIpaInfo = async (path) => {
  try {
    var fd = fs.openSync(path, 'r');
    const ipaInfo = (await ipaExtractInfo(fd))?.info;
    if (Array.isArray(ipaInfo)) {
      return ipaInfo[0];
    }
    throw { ipaInfo };
  } catch (e) {
    logger.error(e, 'getIpaInfo');
    throw new ApiError('Error reading IPA file');
  }
};
