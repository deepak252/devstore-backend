const router = require('express').Router();
const { 
  getAllApps, 
  getAppById, 
  createApp 
} = require('../controllers/appsController');

router.get('/', getAllApps);
router.get('/:id', getAppById);
router.post('/', createApp);
  
module.exports = router;