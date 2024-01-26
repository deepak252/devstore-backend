import Metadata from '../models/metadata.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { isMongoId } from '../utils/mongoUtil.js';
import { handleError } from '../utils/responseUtil.js';
import Logger from '../utils/logger.js';

const logger = new Logger('MetadataController');

export const getMetadata = async (req, res) => {
  try {
    let result = await Metadata.findOne({ enabled: true }).select(
      'appCategories websiteCategories gameCategories'
    );
    res.json(new ApiResponse(undefined, result));
  } catch (e) {
    logger.error(e, 'getMetadata');
    return handleError(e, res);
  }
};

export const createMetadata = async (req, res) => {
  try {
    const { appCategories, websiteCategories, gameCategories } = req.body;
    let metadata = new Metadata({
      appCategories,
      websiteCategories,
      gameCategories
    });
    const error = metadata.validateSync();
    if (error) {
      throw new ApiError(error.message);
    }
    metadata = await metadata.save();
    res.json(new ApiResponse('Metadata created successfully', metadata));
  } catch (e) {
    logger.error(e, 'createMetadata');
    return handleError(e, res);
  }
};

export const deleteMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoId(id)) {
      throw new ApiError('Invalid metadata Id');
    }
    let result = await Metadata.findByIdAndDelete(id);
    return res.json(new ApiResponse('Metadata deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteMetadata');
    return handleError(e, res);
  }
};
