// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateResetPassword, validateUpdatePassword } = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', validateRegister, forgotPassword); // Sử dụng validateRegister để kiểm tra email
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);
router.put('/update-password', protect, validateUpdatePassword, updatePassword);

module.exports = router;