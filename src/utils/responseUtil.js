import { ApiError } from './ApiError.js';
import { ApiResponse } from './ApiResponse.js';

export const handleError = (e, res) => {
  if (e instanceof ApiError) {
    return res
      .status(e.statusCode)
      .json(new ApiResponse(e.message, undefined, e.statusCode));
  }
  return res.status(500).json(new ApiResponse(e.message, undefined, 500));
};
