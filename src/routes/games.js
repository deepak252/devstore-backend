const router = require('express').Router();
const upload = require('../config/upload');
const {
  getGames,
  getGameById,
  createGame,
  uploadApp,
} = require('../controllers/gamesController');
const { userAuth } = require('../middlewares/auth.middleware');

router.get('/', getGames);
router.get('/:id', getGameById);
router.post(
  '/',
  userAuth,
  upload.fields([
    { name: 'attachmentImages', maxCount: 8 },
    { name: 'attachmenVideo', maxCount: 1 },
    { name: 'attachmentIcon', maxCount: 1 },
  ]),
  createGame
);
router.post('/upload', userAuth, upload.single('attachmentApp'), uploadApp);

module.exports = router;
