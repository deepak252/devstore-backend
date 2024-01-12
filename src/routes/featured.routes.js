import { Router } from 'express';
import {
  featuredProjects,
  getBanners,
  createBanner
} from '../controllers/featured.controller.js';

const router = Router();

router.get('/all', featuredProjects);
router.get('/banners', getBanners);
router.post('/banners', createBanner);

export default router;
