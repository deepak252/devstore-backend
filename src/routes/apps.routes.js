import { Router } from 'express';
import {
  getApps,
  getAppById,
  createApp,
  uploadApp,
  deleteApp
} from '../controllers/apps.controller.js';
import { userAuth, userToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/', userToken, getApps);
router.get('/:appId', userToken, getAppById);
router.post(
  '/create',
  userAuth,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmentGraphic', maxCount: 1 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 }
  ]),
  createApp
);
router.post('/upload', userAuth, upload.single('attachmentApp'), uploadApp);
router.delete('/:appId', userAuth, deleteApp);

export default router;
