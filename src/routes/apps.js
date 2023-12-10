const router = require('express').Router();
const { getAllApps, getAppById } = require('../controllers/appsController');

router.get('/', getAllApps);
router.get('/:id', getAppById);

module.exports = router;