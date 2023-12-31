const router = require('express').Router();
const upload = require('../config/upload');
const {
  getWebsites,
  getWebsiteById,
  createWebsite,
} = require('../controllers/websitesController');
const { userAuth } = require('../middlewares/auth.middleware');

router.get('/', getWebsites);
router.get('/:id', getWebsiteById);
router.post(
  '/',
  userAuth,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 },
  ]),
  createWebsite
);

module.exports = router;
