const { Metadata } = require('../models');
const { BadRequestError } = require('../utils/errors');
const Logger = require('../utils/logger');
const { isMongoId } = require('../utils/mongoUtil');
const { success, handleError } = require('../utils/responseUtil');

const logger = new Logger('MetadataController');

exports.getMetadata = async (req, res) => {
  try {
    let result = await Metadata.findOne({ enabled: true }).select(
      'appCategories websiteCategories gameCategories'
    );
    res.json(success(undefined, result));
  } catch (e) {
    logger.error(e, 'getMetadata');
    return handleError(e, res);
  }
};

exports.createMetadata = async (req, res) => {
  try {
    const { appCategories, websiteCategories, gameCategories } = req.body;
    let metadata = new Metadata({
      appCategories,
      websiteCategories,
      gameCategories,
    });
    const error = metadata.validateSync();
    if (error) {
      throw new BadRequestError(error.message);
    }
    metadata = await metadata.save();
    res.json(success('Metadata created successfully', metadata));
  } catch (e) {
    logger.error(e, 'createMetadata');
    return handleError(e, res);
  }
};

exports.deleteMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoId(id)) {
      throw new BadRequestError('Invalid metadata Id');
    }
    let result = await Metadata.findByIdAndDelete(id);
    return res.json(success('Metadata deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteMetadata');
    return handleError(e, res);
  }
};
