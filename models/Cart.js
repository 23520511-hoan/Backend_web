// models/Cart.js
const mongoose = require('mongoose');

// Định nghĩa Schema cho mỗi sản phẩm trong giỏ hàng
const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    validate: {
      validator: function(val) {
        // Kiểm tra số lượng tối đa dựa trên stock (cần populate book)
        return true; // Sẽ xử lý ở controller để linh hoạt hơn
      },
      message: 'Số lượng vượt quá tồn kho'
    }
  }
}, {
  _id: false // Không tạo _id cho sub-document này
});

// Định nghĩa Schema Giỏ hàng chính
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Mỗi người dùng chỉ có một giỏ hàng
  },
  items: [cartItemSchema], // Danh sách các sản phẩm trong giỏ hàng
}, {
  timestamps: true
});

// Virtual để tính tổng giá trị giỏ hàng
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => total + (item.book.discountPrice || item.book.price) * item.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

// Export Cart dưới dạng Object để Cart Controller có thể import
module.exports = {
  Cart,
  cartSchema // Export schema nếu cần dùng trong Order model
};