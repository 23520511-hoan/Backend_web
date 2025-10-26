// models/Order.js
const mongoose = require('mongoose');

// 1. Định nghĩa Schema cho Thông tin Giao hàng
const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, default: 'Việt Nam' }
}, {
  _id: false
});

// 2. Định nghĩa Schema cho các sản phẩm trong Đơn hàng
const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  title: { type: String, required: true },
  coverImage: { type: String },
  price: { type: Number, required: true }, // Giá tại thời điểm mua (đã tính KM)
  quantity: { type: Number, required: true, min: 1 },
}, {
  _id: false
});

// 3. Định nghĩa Schema Đơn hàng chính
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Card', 'VNPay', 'PayPal']
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentInfo: {
    id: { type: String }, // Transaction ID
    status: { type: String },
    paidAt: { type: Date }
  },
  notes: {
    type: String,
    trim: true
  },
  deliveredAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Virtual để tính tổng giá trị đơn hàng
orderSchema.virtual('totalPriceCalculated').get(function() {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0) + this.shippingPrice + this.taxPrice;
});

const Order = mongoose.model('Order', orderSchema);

// Export Order dưới dạng Object để Order Controller có thể import
module.exports = {
  Order,
  orderSchema
};