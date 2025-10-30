// routes/order.routes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateOrderCreate } = require('../middleware/validate');

router.use(protect);

router.post('/', validateOrderCreate, createOrder); // Tạo đơn hàng
router.get('/my-orders', getUserOrders); // Lấy đơn hàng của người dùng hiện tại
router.get('/:id', getSingleOrder); // Lấy chi tiết đơn hàng

// Admin routes
router.get('/', authorize('admin'), getAllOrders); // Lấy tất cả đơn hàng
router.put('/:id/status', authorize('admin'), updateOrderStatus); // Cập nhật trạng thái (Admin)
router.put('/:id/cancel', cancelOrder); // Hủy đơn hàng (User/Admin)

module.exports = router;