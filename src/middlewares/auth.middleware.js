const { User } = require("../models");
const { verifyJwtToken } = require("../utils/authUtil");
const { failure } = require("../utils/responseUtil");

/**
 *  Verify User token
 * */
exports.userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new Error("token is required");
    }
    let { user } = verifyJwtToken(token);
    user = await User.findById(user._id);
    if (!user) {
      throw new Error("User does not exist");
    }
    // token verified successfully
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(400)
      .json(failure("Authentication Error : " + err.message || err));
  }
};
