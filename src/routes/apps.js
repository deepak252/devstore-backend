const router = require('express').Router();
const upload = require('../config/upload');
const {
  getApps,
  getAppById,
  createApp,
  uploadApp,
} = require('../controllers/appsController');
const { userAuth } = require('../middlewares/auth.middleware');

router.get('/', getApps);
router.get('/:id', getAppById);
router.post(
  '/',
  userAuth,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 },
  ]),
  createApp
);
router.post('/upload', userAuth, upload.single('attachmentApp'), uploadApp);

module.exports = router;
