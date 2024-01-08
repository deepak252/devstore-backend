const { INVALID_USERNAMES } = require('../config/constants');
const { SELECTED_FIELDS, POPULATE_OWNER } = require('../config/queryFilters');
const { User, App } = require('../models');
const { BadRequestError } = require('../utils/errors');
const Logger = require('../utils/logger');
const { isMongoId } = require('../utils/mongoUtil');
const { success, handleError } = require('../utils/responseUtil');

const logger = new Logger('UserController');

/**
 *  Auth Token Required
 * */
exports.getUser = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    if (!userId) {
      throw new BadRequestError('userId is required');
    }
    if (!isMongoId(userId)) {
      throw new BadRequestError('Invalid userId');
    }
    let result = await User.findById(userId);
    if (!result) {
      throw new BadRequestError('User does not exist');
    }
    return res.json(success(undefined, result));
  } catch (e) {
    logger.error(e, 'getUser');
    return handleError(e, res);
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username?.trim()?.length) {
      throw new BadRequestError("username can't be empty");
    }
    const isMe = username === req.user?.username;
    const exclude = !isMe
      ? '-favoriteApps -favoriteGames -favoriteWebsites'
      : '';
    let result = await User.findByUsername(username).select(
      `-password ${exclude}`
    );
    if (!result) {
      throw new BadRequestError('User does not exist');
    }
    let filter = {};
    if (!isMe) {
      filter = { isPrivate: false };
    }
    let selectedFields = SELECTED_FIELDS + '  featureGraphic';
    let apps = await App.find(filter)
      .populate(POPULATE_OWNER)
      .select(selectedFields);
    result.apps = apps;
    return res.json(success(undefined, result));
  } catch (e) {
    logger.error(e, 'getUserByUsername');
    return handleError(e, res);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id, name, email, phone } = req.body;
    const { _id: userId } = req.user;
    if (!userId) {
      throw new BadRequestError('userId is required');
    }
    if (!isMongoId(userId)) {
      throw new BadRequestError('Invalid userId');
    }
    let result = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phone,
      },
      { runValidators: true, new: true }
    );

    if (!result) {
      throw new BadRequestError('User does not exist');
    }
    return res.json(success('User updated successfully', result));
  } catch (e) {
    logger.error(e, 'updateUser');
    return handleError(e, res);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new BadRequestError('userId is required');
    }
    if (!isMongoId(userId)) {
      throw new BadRequestError('Invalid userId');
    }

    let result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new BadRequestError('User does not exist');
    }

    return res.json(success('User deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteUser');
    return handleError(e, res);
  }
};

exports.checkUsernameAvailable = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      throw new BadRequestError('Username is required');
    }
    if (INVALID_USERNAMES.includes(username.toLowerCase())) {
      throw new BadRequestError('Username is not available');
    }
    const result = await User.findByUsername(username);
    if (result) {
      throw new BadRequestError('Username is not available');
    }
    return res.json(success('Username is available'));
  } catch (e) {
    logger.error(e, 'checkUsernameAvailable');
    return handleError(e, res);
  }
};
