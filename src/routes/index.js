const router = require('express').Router();

router.use('/apps', require('./apps'));

module.exports = router;