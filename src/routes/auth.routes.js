import { Router } from 'express';
import {
  signIn,
  signUp,
  resetPassword
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signIn', signIn);
router.post('/signUp', signUp);
router.post('/resetPassword', resetPassword);

export default router;
