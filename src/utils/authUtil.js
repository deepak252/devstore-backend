import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY
} from '../config/environment.js';

/**
 * @returns JWT Access token
 */
export const generateAccessToken = ({ _id, username, email, fullName }) => {
  return jwt.sign({ _id, username, email, fullName }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

/**
 * @returns JWT Refresh token
 */
export const generateRefreshToken = ({ _id }) => {
  return jwt.sign({ _id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
};

/**
 * @param token - JWT Access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * @param token - JWT Access token
 * @returns user
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

export const getHashedPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};

export const comparePassword = async (candidatePassword, password) => {
  return await bcryptjs.compare(candidatePassword, password);
};
