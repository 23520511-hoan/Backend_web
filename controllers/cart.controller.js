// controllers/cart.controller.js
const { Cart } = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.book',
        select: 'title price discountPrice coverImage stock authors publisher',
        populate: [
          { path: 'authors', select: 'name' },
          { path: 'publisher', select: 'name' }
        ]
      });

    // Tạo giỏ hàng nếu chưa có
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy giỏ hàng', error: error.message });
  }
};

// @desc    Add/Update item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    // 1. Kiểm tra sách có tồn tại và còn hoạt động
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
    }

    // 2. Lấy giỏ hàng của người dùng
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // 3. Kiểm tra và cập nhật số lượng
    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

    if (itemIndex > -1) {
      // Cập nhật số lượng sách đã có
      const currentQuantity = cart.items[itemIndex].quantity;
      const newQuantity = currentQuantity + quantity;

      if (newQuantity <= 0) {
        // Nếu số lượng mới <= 0 thì xóa khỏi giỏ hàng
        cart.items.splice(itemIndex, 1);
      } else if (book.stock < newQuantity) {
        return res.status(400).json({ success: false, message: `Sách "${book.title}" không đủ số lượng. Còn lại: ${book.stock}` });
      } else {
        cart.items[itemIndex].quantity = newQuantity;
      }
    } else {
      // Thêm sách mới vào giỏ
      if (book.stock < quantity) {
        return res.status(400).json({ success: false, message: `Sách "${book.title}" không đủ số lượng. Còn lại: ${book.stock}` });
      }
      if (quantity > 0) {
        cart.items.push({ book: bookId, quantity });
      }
    }

    await cart.save();

    // 4. Trả về giỏ hàng đã cập nhật (có populate)
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title price discountPrice coverImage stock authors publisher',
      populate: [
        { path: 'authors', select: 'name' },
        { path: 'publisher', select: 'name' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công',
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi thêm vào giỏ hàng', error: error.message });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:bookId
// @access  Private
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng phải lớn hơn 0' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
    }

    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại trong giỏ hàng' });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive || book.stock < quantity) {
      return res.status(400).json({ success: false, message: `Sách "${book ? book.title : 'không xác định'}" không đủ số lượng. Còn lại: ${book ? book.stock : 0}` });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title price discountPrice coverImage stock authors publisher',
      populate: [
        { path: 'authors', select: 'name' },
        { path: 'publisher', select: 'name' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật số lượng thành công',
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật số lượng', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:bookId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
    }

    // Lọc bỏ sách khỏi giỏ hàng
    cart.items = cart.items.filter(item => item.book.toString() !== bookId);

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title price discountPrice coverImage stock authors publisher',
      populate: [
        { path: 'authors', select: 'name' },
        { path: 'publisher', select: 'name' }
      ]
    });

    res.status(200).json({ success: true, message: 'Đã xóa khỏi giỏ hàng', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa khỏi giỏ hàng', error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = []; // Xóa tất cả items
    await cart.save();

    res.status(200).json({ success: true, message: 'Giỏ hàng đã được dọn sạch', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi dọn sạch giỏ hàng', error: error.message });
  }
};