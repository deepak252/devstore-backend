import { BadRequestError } from './errors.js';

export const success = (message, data) => ({
  success: true,
  message,
  data
});

export const failure = (message) => ({
  success: false,
  message
});

export const handleError = (e, res) => {
  if (e instanceof BadRequestError) {
    return res.status(400).json(failure(e.message));
  }
  return res.status(500).json(failure('Internal Server Error'));
};
