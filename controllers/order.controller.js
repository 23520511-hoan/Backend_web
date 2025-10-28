// controllers/order.controller.js
const Order = require('../models/Order');
const { Cart } = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    const itemsPrice = cart.items.reduce(
      (total, item) => total + (item.book.discountPrice || item.book.price) * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500000 ? 0 : 30000; // Miễn phí vận chuyển nếu đơn hàng > 500k
    const taxPrice = itemsPrice * 0.1; // Thuế 10%
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const orderItems = cart.items.map(item => ({
      book: item.book._id,
      title: item.book.title,
      coverImage: item.book.coverImage,
      price: item.book.discountPrice || item.book.price,
      quantity: item.quantity
    }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      notes
    });

    // Update book stock
    for (const item of cart.items) {
      const book = await Book.findById(item.book._id);
      if (book) {
        book.stock -= item.quantity;
        book.soldCount += item.quantity;
        await book.save();
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.book', 'title coverImage');

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate('items.book', 'title coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.book', 'title coverImage');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đơn hàng này'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết đơn hàng',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.book', 'title coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    // Validate orderStatus
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái đơn hàng không hợp lệ'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Update status and relevant timestamps
    order.orderStatus = orderStatus;
    if (orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    } else if (orderStatus === 'Cancelled') {
      order.cancelledAt = Date.now();
      // Restore book stock
      for (const item of order.items) {
        const book = await Book.findById(item.book);
        if (book) {
          book.stock += item.quantity;
          book.soldCount -= item.quantity;
          await book.save();
        }
      }
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.book', 'title coverImage');

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

// @desc    Cancel order (User/Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy đơn hàng này'
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã bị hủy trước đó'
      });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng đã giao'
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = Date.now();

    // Restore book stock
    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.quantity;
        book.soldCount -= item.quantity;
        await book.save();
      }
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.book', 'title coverImage');

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đơn hàng',
      error: error.message
    });
  }
};

// Export all functions correctly
module.exports = {
  createOrder: exports.createOrder,
  getUserOrders: exports.getUserOrders,
  getSingleOrder: exports.getSingleOrder,
  getAllOrders: exports.getAllOrders,
  updateOrderStatus: exports.updateOrderStatus,
  cancelOrder: exports.cancelOrder
};