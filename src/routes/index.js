const router = require('express').Router();
const { delay } = require('../middlewares/delay.middleware');

router.use(delay);

router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/metadata', require('./metadata'));
router.use('/apps', require('./apps'));
router.use('/games', require('./games'));
router.use('/websites', require('./website'));
router.use('/featured', require('./featured'));

module.exports = router;
