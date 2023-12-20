const router = require('express').Router();
const {
  getUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  checkUsernameAvailable,
} = require('../controllers/userController');
const { userAuth, userToken } = require('../middlewares/auth.middleware');

router.get('/', userAuth, getUser);
router.get('/:username', userToken, getUserByUsername);
router.put('/', userAuth, updateUser);
router.delete('/:userId', deleteUser);
router.post('/usernameAvailable', checkUsernameAvailable);

module.exports = router;
