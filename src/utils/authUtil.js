const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { JWT_SECRET } = require("../config");

/**
 * @param  user - mongo user instance
 * @returns JWT token
 */
exports.getJwtToken = (user) => jwt.sign({ user }, JWT_SECRET);

/**
 * @param token - JWT token
 * @returns user
 */
exports.verifyJwtToken = (token) => jwt.verify(token, JWT_SECRET);

exports.getHashedPassword = async (password)=>{
  return await bcryptjs.hash(password, 10);
}

exports.comparePassword = async(candidatePassword, password)=>{
  return await bcryptjs.compare(candidatePassword, password);
}

 