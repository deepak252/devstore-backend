import User from '../models/User.js';
import App from '../models/App.js';
import { INVALID_USERNAMES } from '../config/constants.js';
import { SELECTED_FIELDS, POPULATE_OWNER } from '../config/queryFilters.js';
import { BadRequestError } from '../utils/errors.js';
import { isMongoId } from '../utils/mongoUtil.js';
import { success, handleError } from '../utils/responseUtil.js';
import Logger from '../utils/logger.js';

const logger = new Logger('UserController');

/**
 *  Auth Token Required
 * */
export const getUser = async (req, res) => {
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

export const getUserByUsername = async (req, res) => {
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

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
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
        phone
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

export const deleteUser = async (req, res) => {
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

export const checkUsernameAvailable = async (req, res) => {
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
