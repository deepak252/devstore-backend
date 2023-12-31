const { bucket, getDownloadURL } = require('../config/firebase');
const Logger = require('../utils/logger');
const logger = new Logger('firebaseStorage');

// https://googleapis.dev/nodejs/storage/latest/Bucket.html#upload
const uploadFileToStorage = async (localPath, destPath) => {
  try {
    const options = {
      destination: destPath,
      gzip: true,
    };
    await bucket.upload(localPath, options);
    const file = bucket.file(destPath);
    const downloadUrl = await getDownloadURL(file);
    // logger.info(downloadUrl, 'uploadFileToStorage' );
    logger.info(
      `File ${localPath} uploaded to storage: ${destPath}`,
      'uploadFileToStorage'
    );
    return downloadUrl;
  } catch (e) {
    logger.error(e, 'uploadFileToStorage');
    return new Error('Error while uploading file');
  }
};

const uploadFilesToStorage = async (localPaths, destPath) => {
  const urls = [];
  for (local of localPaths) {
    const url = await uploadFileToStorage(local, destPath);
    urls.push(url);
  }
  return urls;
};

const deleteFileFromStorage = async (destPath) => {
  try {
    if (!destPath) {
      return new Error(`Invalid file path: ${destPath}`);
    }
    const file = bucket.file(destPath);
    const result = await file.delete();
    // logger.info(downloadUrl, 'uploadFileToStorage' );
    // logger.info(`File ${localPath} uploaded to gs://${bucket.name}/${destPath}`, 'uploadFileToStorage');
    if (Array.isArray(result) && result.length) {
      return result[0];
    }
    return result;
  } catch (e) {
    logger.error(e, 'deleteFileFromStorage');
    return new Error(`Error while deleting file: ${destPath}`);
  }
};

const deleteFilesFromStorage = async (destPaths = []) => {
  try {
    const result = await Promise.all(
      destPaths.map(async (path) => {
        return await deleteFileFromStorage(path);
      })
    );
    return result;
  } catch (e) {
    logger.error(e, 'deleteFilesFromStorage');
    throw new Error('Error while deleting files');
  }
};
module.exports = {
  uploadFileToStorage,
  uploadFilesToStorage,
  deleteFileFromStorage,
  deleteFilesFromStorage,
};
