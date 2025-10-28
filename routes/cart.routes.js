// routes/cart.routes.js
const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateAddToCart, validateUpdateQuantity } = require('../middleware/validate');

router.use(protect); // Tất cả route giỏ hàng đều yêu cầu đăng nhập

router.get('/', getCart); // Lấy giỏ hàng
router.post('/items', validateAddToCart, addToCart); // Thêm/Cập nhật item vào giỏ hàng
router.put('/items/:bookId', validateUpdateQuantity, updateCartItemQuantity); // Cập nhật số lượng
router.delete('/items/:bookId', removeFromCart); // Xóa item
router.delete('/', clearCart); // Xóa toàn bộ giỏ hàng

module.exports = router;