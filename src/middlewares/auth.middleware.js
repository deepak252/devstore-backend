import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { verifyAccessToken } from '../utils/authUtil.js';
import Logger from '../utils/logger.js';

const logger = new Logger('AuthMiddleware');

/**
 *  Verify User token
 * */
export const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new Error('token is required');
    }
    let { user } = verifyAccessToken(token);
    user = await User.findById(user._id).lean();
    if (!user) {
      throw new Error('User does not exist');
    }
    // token verified successfully
    req.user = user;
    next();
  } catch (err) {
    logger.error(err, 'userAuth');
    return res
      .status(401)
      .json(new ApiResponse('Authentication Error', undefined, 401));
  }
};

export const userToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const { user } = verifyAccessToken(token);
      req.user = await User.findById(user._id).lean();
    }
  } catch (err) {
    logger.error(err, 'userToken');
  }
  next();
};
