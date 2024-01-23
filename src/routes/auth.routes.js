import { Router } from 'express';
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  refreshAccessToken
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signIn', signIn);
router.post('/signUp', signUp);
router.post('/signOut', verifyJWT, signOut);
router.post('/refreshToken', refreshAccessToken);
router.post('/resetPassword', resetPassword);

export default router;
