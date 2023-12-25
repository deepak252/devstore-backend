const { User } = require('../models');
const { failure, success, handleError } = require('../utils/responseUtil');
const { getJwtToken, getHashedPassword } = require('../utils/authUtil');
const { REGEX } = require('../config/constants');
const Logger = require('../utils/logger');
const { BadRequestError } = require('../utils/errors');

const logger = new Logger('AuthController');

exports.signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = new User({
      username,
      email,
      password,
    });
    let error = user.validateSync();
    if (error) {
      throw new BadRequestError(error.message);
    }
    if (password.length < 4) {
      throw new BadRequestError('Password must contain at least 4 characters');
    }
    user.password = await getHashedPassword(password);
    user = await user.save();
    const token = getJwtToken(user);
    return res.json(success('Account created successfully', { user, token }));
  } catch (e) {
    logger.error(e, 'signUp');
    if (e.code === 11000) {
      //duplicate key error, unique value
      return res
        .status(400)
        .json(failure('User already exists with given email / username'));
    }
    return handleError(e, res);
  }
};

exports.signIn = async (req, res) => {
  try {
    let { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      throw new BadRequestError('Username/Email and Password are required');
    }
    const user = await User.findByUsernameOrEmail(usernameOrEmail);
    if (!user || !(await user.comparePassword(password))) {
      throw new BadRequestError('Invalid username/email or password');
    }
    const token = getJwtToken(user);
    return res.json(success('Sign in successful', { user, token }));
  } catch (e) {
    logger.error(e, 'signIn');
    return handleError(e, res);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new BadRequestError('Email and new password are required');
    }
    email = email.toLowerCase().trim();
    if (!REGEX.EMAIL.test(email)) {
      throw new BadRequestError('Invalid Email');
    }
    if (newPassword.length < 4) {
      throw new BadRequestError('Password must contain at least 4 characters');
    }

    let user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('User does not exist');
    }
    user.password = await getHashedPassword(newPassword);
    user = await user.save();

    return res.json(success('Password reset successful'));
  } catch (e) {
    logger.error(e, 'resetPassword');
    return handleError(e, res);
  }
};
