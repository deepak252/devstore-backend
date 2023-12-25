const router = require('express').Router();
const { 
  signIn, 
  signUp, 
  resetPassword 
} = require('../controllers/authController');

router.post('/signIn', signIn);
router.post('/signUp', signUp);
router.post('/resetPassword', resetPassword);
  
module.exports = router;