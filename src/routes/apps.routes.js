import { Router } from 'express';
import {
  getApps,
  getAppById,
  createApp,
  uploadApp,
  deleteApp
} from '../controllers/apps.controller.js';
import { verifyJWT, userToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/', userToken, getApps);
router.get('/:appId', userToken, getAppById);
router.post(
  '/create',
  verifyJWT,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmentGraphic', maxCount: 1 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 }
  ]),
  createApp
);
router.post('/upload', verifyJWT, upload.single('attachmentApp'), uploadApp);
router.delete('/:appId', verifyJWT, deleteApp);

export default router;
