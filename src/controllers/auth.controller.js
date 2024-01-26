import User from '../models/user.model.js';
import { getHashedPassword, verifyRefreshToken } from '../utils/authUtil.js';
import { handleError } from '../utils/responseUtil.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Logger from '../utils/logger.js';
import { REGEX } from '../constants.js';

const logger = new Logger('AuthController');

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found');
  }
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

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
    user = user.toJSON();
    delete user.password;
    delete user.refreshToken;

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
      throw new ApiError('username/email and password are required');
    }
    let user = await User.findByUsernameOrEmail(usernameOrEmail);
    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError('Invalid username/email or password');
    }
    user = user.toJSON();
    delete user.password;
    delete user.refreshToken;

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse('Sign in successful', {
          user,
          accessToken
        })
      );
  } catch (e) {
    logger.error(e, 'signIn');
    return handleError(e, res);
  }
};

export const signOut = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: { refreshToken: 1 } // remove the field from document
      },
      { new: true } //ensures that the updated document is returned.
    );
    console.log(req.cookies);

    const options = {
      httpsOnly: true,
      secure: true
    };
    res
      .status(200)
      .clearCookie('accessToken', options)
      .clearCookie('refreshToken', options)
      .json(new ApiResponse(200, {}, 'Sign out successful'));
  } catch (e) {
    logger.error(e, 'signOut');
    return handleError(e, res);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    const decodedToken = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(new ApiResponse('Access token refreshed', { accessToken }));
  } catch (e) {
    logger.error(e, 'refreshAccessToken');
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
