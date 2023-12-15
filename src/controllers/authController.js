const { User } = require("../models");
const { failure, success } = require("../utils/responseUtil");
const { getJwtToken, getHashedPassword } = require("../utils/authUtil");
const { REGEX } = require("../config/constants");
const Logger = require("../utils/logger");

const logger = new Logger("AuthController");

exports.signUp = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    let user = new User({
      name,
      email,
      phone,
      password,
    });
    let error = user.validateSync();
    if (error) {
      throw error;
    }
    if (password.length < 4) {
      throw new Error("Password must contain at least 4 characters");
    }
    user.password = await getHashedPassword(password);
    user = await user.save();
    const token = getJwtToken(user);
    return res.json(success("Account created successfully", { user, token }));
  } catch (e) {
    logger.error(e, "signUp");
    if (e.code === 11000) {
      //duplicate key error, unique value
      return res
        .status(400)
        .json(failure("User already exists with given email / phone"));
    }
    return res.status(400).json(failure(e.message || e));
  }
};

exports.signIn = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and Password are required");
    }
    email = email.toLowerCase().trim();

    if (!REGEX.EMAIL.test(email)) {
      throw new Error("Invalid Email");
    }
    let user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid email or password");
    }
    const token = getJwtToken(user);
    return res.json(success("Sign in successful", { user, token }));
  } catch (e) {
    logger.error(e, "signIn");
    return res.status(400).json(failure(e.message || e));
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new Error("Email and new password are required");
    }
    email = email.toLowerCase().trim();
    if (!REGEX.EMAIL.test(email)) {
      throw new Error("Invalid Email");
    }
    if (newPassword.length < 4) {
      throw new Error("Password must contain at least 4 characters");
    }

    let user = await User.findOne({ email });
    if (!user) {
      throw new Error("User does not exist");
    }
    user.password = await getHashedPassword(newPassword);
    user = await user.save();

    return res.json(success("Password reset successful"));
  } catch (e) {
    logger.error(e, "resetPassword");
    return res.status(400).json(failure(e.message || e));
  }
};
