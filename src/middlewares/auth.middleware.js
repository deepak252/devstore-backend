import User from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { verifyAccessToken } from '../utils/authUtil.js';
import Logger from '../utils/logger.js';

const logger = new Logger('AuthMiddleware');

/**
 *  Verify User token
 * */
export const verifyJWT = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new Error('token is required');
    }
    let decodedToken = verifyAccessToken(accessToken);
    let user = await User.findById(decodedToken?._id)
      .select('-password -refreshToken')
      .lean();
    if (!user) {
      throw new Error('Invalid access token');
    }
    // token verified successfully
    req.user = user;
    next();
  } catch (err) {
    logger.error(err, 'verifyJWT');
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
