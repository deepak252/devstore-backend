import { Router } from 'express';
import {
  getUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  checkUsernameAvailable
} from '../controllers/user.controller.js';
import { verifyJWT, checkUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verifyJWT, getUser);
router.get('/:username', checkUser, getUserByUsername);
router.put('/', verifyJWT, updateUser);
router.delete('/:userId', deleteUser);
router.post('/usernameAvailable', checkUsernameAvailable);

export default router;
