const { User } = require("../models");
const Logger = require("../utils/logger");
const { isMongoId } = require("../utils/mongoUtil");
const { success, failure } = require("../utils/responseUtil");

const logger = new Logger('UserController');

/**
 *  Auth Token Required
 * */
exports.getUser = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    if (!userId) {
      throw new Error("userId is required");
    }
    if (!isMongoId(userId)) {
      throw new Error("Invalid userId");
    }
    let result = await User.findById(userId);
    if (!result) {
      throw new Error("User does not exist");
    }
    return res.json(success(undefined, result ));
  } catch (e) {
    logger.error(e,'getUser');
    return res.status(400).json(failure(e.message || e));
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new Error("userId is required");
    }
    if (!isMongoId(userId)) {
      throw new Error("Invalid userId");
    }
    let result = await User.findById(userId);
    if (!result) {
      throw new Error("User does not exist");
    }
    return res.json(success(undefined, result ));
  } catch (e) {
    logger.error(e,'getUserById');
    return res.status(400).json(failure(e.message || e));
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id, name, email, phone } = req.body;
    const { _id: userId } = req.user;
    if (!userId) {
      throw new Error("userId is required");
    }
    if (!isMongoId(userId)) {
      throw new Error("Invalid userId");
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
      throw new Error("User does not exist");
    }
    return res.json(success("User updated successfully", result));
  } catch (e) {
    logger.error(e,'updateUser');
    return res.json(failure(e.message || e));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new Error("userId is required");
    }
    if (!isMongoId(userId)) {
      throw new Error("Invalid userId");
    }

    let result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new Error("User does not exist");
    }

    return res.json(success( "User deleted successfully", result));
  } catch (e) {
    logger.error(e,'deleteUser');
    return res.json(failure(e.message || e));
  }
};
