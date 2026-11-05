const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Optional protect middleware helper so public can browse users, but if logged in, excludes self
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getAllUsers);
router.get('/:id', getUserById);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
