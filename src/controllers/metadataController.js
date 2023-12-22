const { Metadata } = require('../models');
const Logger = require('../utils/logger');
const { isMongoId } = require('../utils/mongoUtil');
const { success, failure } = require('../utils/responseUtil');

const logger = new Logger('MetadataController');

exports.getMetadata = async (req, res) => {
  try {
    let result = await Metadata.findOne({ enabled: true }).select(
      'appCategories websiteCategories gameCategories'
    );
    res.json(success(undefined, result));
  } catch (e) {
    console.error('Error:getMetadata, ', e);
    res.status(400).json(failure(e.message || e));
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
      throw error;
    }
    metadata = await metadata.save();
    res.json(success('Metadata created successfully', metadata));
  } catch (e) {
    console.error('Error: createMetadata, ', e);
    res.status(400).json(failure(e.message || e));
  }
};

exports.deleteMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoId(id)) {
      throw new Error('Invalid metadata Id');
    }

    let result = await Metadata.findByIdAndDelete(id);
    return res.json(success('Metadata deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteMetadata');
    return res.json(failure(e.message || e));
  }
};
