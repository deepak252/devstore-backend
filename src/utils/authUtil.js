import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { JWT_SECRET } from '../config/enironment.js';

/**
 * @param  user - mongo user instance
 * @returns JWT token
 */
export const getJwtToken = (user) => jwt.sign({ user }, JWT_SECRET);

/**
 * @param token - JWT token
 * @returns user
 */
export const verifyJwtToken = (token) => jwt.verify(token, JWT_SECRET);

export const getHashedPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};

export const comparePassword = async (candidatePassword, password) => {
  return await bcryptjs.compare(candidatePassword, password);
};
