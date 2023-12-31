const router = require('express').Router();
const upload = require('../config/upload');
const {
  getApps,
  getAppById,
  createApp,
  uploadApp,
  deleteApp,
} = require('../controllers/appsController');
const { userAuth, userToken } = require('../middlewares/auth.middleware');

router.post('/', userToken, getApps);
router.get('/:appId', userToken, getAppById);
router.post(
  '/create',
  userAuth,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmentGraphic', maxCount: 1 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 },
  ]),
  createApp
);
router.post('/upload', userAuth, upload.single('attachmentApp'), uploadApp);
router.delete('/:appId', userAuth, deleteApp);

module.exports = router;
