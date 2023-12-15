const router = require('express').Router();
const { getUser, getUserById, updateUser, deleteUser } = require('../controllers/userController'); 
const { userAuth } = require('../middlewares/auth.middleware');

router.get('/', userAuth, getUser);
router.get('/:userId', getUserById);
router.put('/', userAuth, updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;