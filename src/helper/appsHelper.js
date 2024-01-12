import UploadApp from '../models/UploadApp.js';
import Logger from '../utils/logger.js';
import { deleteFilesFromStorage } from './firebaseStorage.js';

const logger = new Logger('appsHelper');

/**
 * 1. Delete unused apps from storage
 * 2. Delete documents from UploadApp collection
 */
export const deleteUserUploadedAppsFromBin = async (userId) => {
  try {
    let destPaths = await UploadApp.findAllByUserId(userId)
      .lean()
      .select('file');
    destPaths = destPaths.map((e) => e.file.path);
    let deletedFiles = await deleteFilesFromStorage(destPaths);
    const result = await UploadApp.deleteAllByUserId(userId);
    return {
      result,
      deletedFiles
    };
  } catch (e) {
    logger.error(e, 'deleteUserUploadedAppsFromBin');
  }
};
