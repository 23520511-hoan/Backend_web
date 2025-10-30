// middleware/validate.js
const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    next();
  };
};

// Validate Register
exports.validateRegister = validate([
  body('name').notEmpty().withMessage('Tên là bắt buộc').trim(),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự'),
  body('phone').optional().isString().withMessage('Số điện thoại không hợp lệ')
]);

// Validate Login
exports.validateLogin = validate([
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc')
]);

// Validate Reset Password
exports.validateResetPassword = validate([
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự')
]);

// Validate Update Password
exports.validateUpdatePassword = validate([
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải ít nhất 6 ký tự')
]);

// Validate Author Create/Update
exports.validateAuthorCreate = validate([
  body('name').notEmpty().withMessage('Tên tác giả là bắt buộc').trim(),
  body('biography').optional().isString().withMessage('Tiểu sử không hợp lệ'),
  body('nationality').optional().isString().withMessage('Quốc tịch không hợp lệ')
]);

exports.validateAuthorUpdate = exports.validateAuthorCreate;

// Validate Book Create
exports.validateBookCreate = validate([
  body('title').notEmpty().withMessage('Tiêu đề sách là bắt buộc').trim(),
  body('description').notEmpty().withMessage('Mô tả sách là bắt buộc'),
  body('price').isNumeric().withMessage('Giá phải là số').custom(value => value >= 0).withMessage('Giá không thể âm'),
  body('discountPrice').optional().isNumeric().withMessage('Giá khuyến mãi phải là số').custom((value, { req }) => {
    if (value && value >= req.body.price) {
      throw new Error('Giá khuyến mãi phải thấp hơn giá gốc');
    }
    return true;
  }),
  body('categories').isArray({ min: 1 }).withMessage('Phải chọn ít nhất một danh mục'),
  body('authors').isArray({ min: 1 }).withMessage('Phải chọn ít nhất một tác giả'),
  body('publisher').notEmpty().withMessage('Nhà xuất bản là bắt buộc')
]);

exports.validateBookUpdate = exports.validateBookCreate;

// Validate Add to Cart
exports.validateAddToCart = validate([
  body('bookId').isMongoId().withMessage('ID sách không hợp lệ'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0')
]);

// Validate Update Cart Quantity
exports.validateUpdateQuantity = validate([
  param('bookId').isMongoId().withMessage('ID sách không hợp lệ'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0')
]);

// Validate Category Create/Update
exports.validateCategoryCreate = validate([
  body('name').notEmpty().withMessage('Tên danh mục là bắt buộc').trim(),
  body('description').optional().isString().withMessage('Mô tả không hợp lệ')
]);

exports.validateCategoryUpdate = exports.validateCategoryCreate;

// Validate Publisher Create/Update
exports.validatePublisherCreate = validate([
  body('name').notEmpty().withMessage('Tên nhà xuất bản là bắt buộc').trim(),
  body('address.city').optional().isString().withMessage('Thành phố không hợp lệ'),
  body('address.country').optional().isString().withMessage('Quốc gia không hợp lệ')
]);

exports.validatePublisherUpdate = exports.validatePublisherCreate;

// Validate Order Create
exports.validateOrderCreate = validate([
  body('shippingAddress.fullName').notEmpty().withMessage('Tên người nhận là bắt buộc'),
  body('shippingAddress.phone').notEmpty().withMessage('Số điện thoại là bắt buộc'),
  body('shippingAddress.address').notEmpty().withMessage('Địa chỉ là bắt buộc'),
  body('shippingAddress.city').notEmpty().withMessage('Thành phố là bắt buộc'),
  body('paymentMethod').isIn(['COD', 'Card', 'VNPay', 'PayPal']).withMessage('Phương thức thanh toán không hợp lệ')
]);

// Validate User Create
exports.validateUserCreate = validate([
  body('name').notEmpty().withMessage('Tên là bắt buộc').trim(),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Vai trò không hợp lệ')
]);

// Validate Profile Update
exports.validateProfileUpdate = validate([
  body('name').optional().notEmpty().withMessage('Tên không được để trống').trim(),
  body('phone').optional().isString().withMessage('Số điện thoại không hợp lệ'),
  body('address').optional().isObject().withMessage('Địa chỉ phải là object')
]);

exports.validateUserUpdate = exports.validateUserCreate;