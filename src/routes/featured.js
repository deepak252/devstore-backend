
const router = require('express').Router();
const { 
  featuredProjects,
  getBanners,
  createBanner
} = require('../controllers/featuredController');

router.get('/all', featuredProjects);
router.get('/banners', getBanners);
router.post('/banners', createBanner);

module.exports = router;
