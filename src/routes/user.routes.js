import { Router } from 'express';
import {
  getUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  checkUsernameAvailable
} from '../controllers/user.controller.js';
import { verifyJWT, userToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verifyJWT, getUser);
router.get('/:username', userToken, getUserByUsername);
router.put('/', verifyJWT, updateUser);
router.delete('/:userId', deleteUser);
router.post('/usernameAvailable', checkUsernameAvailable);

export default router;
