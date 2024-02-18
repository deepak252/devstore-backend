import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import { INVALID_USERNAMES } from '../constants.js';
import { SELECTED_FIELDS, POPULATE_OWNER } from '../config/queryFilters.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { isMongoId } from '../utils/mongoUtil.js';
import { handleError } from '../utils/responseUtil.js';
import Logger from '../utils/logger.js';

const logger = new Logger('UserController');

/**
 *  Auth Token Required
 * */
export const getUser = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    if (!userId) {
      throw new ApiError('userId is required');
    }
    if (!isMongoId(userId)) {
      throw new ApiError('Invalid userId');
    }
    let result = await User.findById(userId);
    if (!result) {
      throw new ApiError('User does not exist');
    }
    return res.json(new ApiResponse(undefined, result));
  } catch (e) {
    logger.error(e, 'getUser');
    return handleError(e, res);
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username?.trim()?.length) {
      throw new ApiError("username can't be empty");
    }
    const isMe = username === req.user?.username;
    const exclude = !isMe
      ? '-favoriteApps -favoriteGames -favoriteWebsites'
      : '';
    let result = await User.findByUsername(username).select(
      `-password ${exclude}`
    );
    if (!result) {
      throw new ApiError('User does not exist');
    }
    let filter = {};
    if (!isMe) {
      filter = { isPrivate: false };
    }
    let selectedFields = SELECTED_FIELDS + '  featureGraphic';
    let projects = await Project.find(filter)
      .populate(POPULATE_OWNER)
      .select(selectedFields);
    result.projects = projects;
    return res.json(new ApiResponse(undefined, result));
  } catch (e) {
    logger.error(e, 'getUserByUsername');
    return handleError(e, res);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const { _id: userId } = req.user;
    if (!userId) {
      throw new ApiError('userId is required');
    }
    if (!isMongoId(userId)) {
      throw new ApiError('Invalid userId');
    }
    let result = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        phone
      },
      { runValidators: true, new: true }
    );

    if (!result) {
      throw new ApiError('User does not exist');
    }
    return res.json(new ApiResponse('User updated successfully', result));
  } catch (e) {
    logger.error(e, 'updateUser');
    return handleError(e, res);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError('userId is required');
    }
    if (!isMongoId(userId)) {
      throw new ApiError('Invalid userId');
    }

    let result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new ApiError('User does not exist');
    }

    return res.json(new ApiResponse('User deleted successfully', result));
  } catch (e) {
    logger.error(e, 'deleteUser');
    return handleError(e, res);
  }
};

export const checkUsernameAvailable = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      throw new ApiError('Username is required');
    }
    if (INVALID_USERNAMES.includes(username.toLowerCase())) {
      throw new ApiError('Username is not available');
    }
    const result = await User.findByUsername(username);
    if (result) {
      throw new ApiError('Username is not available');
    }
    return res.json(new ApiResponse('Username is available'));
  } catch (e) {
    logger.error(e, 'checkUsernameAvailable');
    return handleError(e, res);
  }
};
