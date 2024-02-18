import { PROJECT_TYPE } from '../constants.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const validateProjectType = async (req, res, next) => {
  const { projectType } = req.params;
  if (!Object.values(PROJECT_TYPE).includes(projectType)) {
    return res.status(401).json(new ApiResponse('Not Found', undefined, 404));
  }
  req.projectType = projectType;
  next();
};
