const { User } = require('../models');
const { verifyJwtToken } = require('../utils/authUtil');
const Logger = require('../utils/logger');
const { failure } = require('../utils/responseUtil');
const logger = new Logger('AuthMiddleware');
/**
 *  Verify User token
 * */
exports.userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new Error('token is required');
    }
    let { user } = verifyJwtToken(token);
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
      .json(failure('Authentication Error'));
  }
};

exports.userToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const { user } = verifyJwtToken(token);
      req.user = await User.findById(user._id);
    }
  } catch (err) {
    logger.error(err, 'userToken');
  }
  next();
};
