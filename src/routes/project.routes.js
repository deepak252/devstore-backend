/* eslint-disable no-unused-vars */
import { Router } from 'express';
import {
  getProjects,
  createProject,
  uploadPackage,
  deleteProject,
  getProjectById
} from '../controllers/project.controller.js';
import { verifyJWT, checkUser } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { validateProjectType } from '../middlewares/project.middleware.js';

const router = Router();

router.post('/:projectType', validateProjectType, checkUser, getProjects);
router.get(
  '/:projectType/:projectId',
  validateProjectType,
  checkUser,
  getProjectById
);
router.post(
  '/:projectType/create',
  validateProjectType,
  verifyJWT,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmentGraphic', maxCount: 1 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 }
  ]),
  createProject
);
router.post(
  '/package/upload',
  verifyJWT,
  upload.single('attachmentPackage'),
  uploadPackage
);
router.delete('/:projectId', verifyJWT, deleteProject);

export default router;
