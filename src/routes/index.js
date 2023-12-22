const router = require('express').Router();
const { delay } = require('../middlewares/delay.middleware');

router.use(delay);

router.use('/apps', require('./apps'));
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/metadata', require('./metadata'));

module.exports = router;
