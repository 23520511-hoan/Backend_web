// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateUserCreate, validateProfileUpdate, validateUserUpdate } = require('../middleware/validate');

router.use(protect); // Tất cả route dưới đây đều cần đăng nhập
router.put('/profile', validateProfileUpdate, updateProfile); // User tự cập nhật
router.get('/', authorize('admin'), getUsers); // Admin
router.get('/:id', authorize('admin'), getUser); // Admin
router.post('/', authorize('admin'), validateUserCreate, createUser); // Admin
router.put('/:id', authorize('admin'), validateUserUpdate, updateUser); // Admin
router.delete('/:id', authorize('admin'), deleteUser); // Admin

module.exports = router;