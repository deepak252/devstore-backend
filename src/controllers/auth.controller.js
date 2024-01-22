import User from '../models/User.js';
import { getHashedPassword } from '../utils/authUtil.js';
import { handleError } from '../utils/responseUtil.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Logger from '../utils/logger.js';
import { REGEX } from '../config/constants.js';

const logger = new Logger('AuthController');

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = new User({
      username,
      email,
      password
    });
    let error = user.validateSync();
    if (error) {
      throw new ApiError(error.message);
    }
    user = await user.save();
    const accessToken = user.getAccessToken();
    return res
      .status(201)
      .json(
        new ApiResponse(
          'Account created successfully',
          { user, accessToken },
          201
        )
      );
  } catch (e) {
    logger.error(e, 'signUp');
    if (e.code === 11000) {
      //duplicate key error, unique value
      return res
        .status(409)
        .json(
          new ApiResponse(
            'User already exists with given email / username',
            undefined,
            409
          )
        );
    }
    return handleError(e, res);
  }
};

export const signIn = async (req, res) => {
  try {
    let { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      throw new ApiError('Username/Email and Password are required');
    }
    const user = await User.findByUsernameOrEmail(usernameOrEmail);
    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError('Invalid username/email or password');
    }
    const accessToken = user.getAccessToken();
    return res.json(
      new ApiResponse('Sign in successful', { user, accessToken })
    );
  } catch (e) {
    logger.error(e, 'signIn');
    return handleError(e, res);
  }
};

export const resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new ApiError('Email and new password are required');
    }
    email = email.toLowerCase().trim();
    if (!REGEX.EMAIL.test(email)) {
      throw new ApiError('Invalid Email');
    }
    if (newPassword.length < 4) {
      throw new ApiError('Password must contain at least 4 characters');
    }

    let user = await User.findOne({ email });
    if (!user) {
      throw new ApiError('User does not exist');
    }
    user.password = await getHashedPassword(newPassword);
    user = await user.save();

    return res.json(new ApiResponse('Password reset successful'));
  } catch (e) {
    logger.error(e, 'resetPassword');
    return handleError(e, res);
  }
};
