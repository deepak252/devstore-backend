import AppPackage from '../models/appPackage.model.js';
import Logger from '../utils/logger.js';
import { deleteFilesFromStorage } from './firebaseStorage.js';

const logger = new Logger('appsHelper');

/**
 * 1. Delete unused apps from storage
 * 2. Delete documents from UploadApp collection
 */
export const deleteAppPackages = async (userId) => {
  try {
    let destPaths = await AppPackage.findAllByUserId(userId)
      .lean()
      .select('file');
    destPaths = destPaths.map((e) => e.file.path);
    let deletedFiles = await deleteFilesFromStorage(destPaths);
    const result = await AppPackage.deleteAllByUserId(userId);
    return {
      result,
      deletedFiles
    };
  } catch (e) {
    logger.error(e, 'deleteAppPackages');
  }
};
