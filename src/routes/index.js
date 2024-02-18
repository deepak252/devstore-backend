import { Router } from 'express';
import { delay } from '../middlewares/delay.middleware.js';
import projectRouter from './project.routes.js';
import userRouter from './user.routes.js';
import authRouter from './auth.routes.js';
import featuredRouter from './featured.routes.js';
import metadataRouter from './metadata.routes.js';

const router = Router();

router.use(delay);

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/metadata', metadataRouter);
router.use('/project', projectRouter);
router.use('/featured', featuredRouter);

export default router;
