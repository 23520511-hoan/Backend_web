// models/Book.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng cung cấp tiêu đề sách'],
    unique: true,
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    index: true // Tối ưu hóa truy vấn
  },
  description: {
    type: String,
    required: [true, 'Vui lòng cung cấp mô tả sách']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng cung cấp giá bán'],
    min: [0, 'Giá bán không thể là số âm']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Giá khuyến mãi không thể là số âm'],
    validate: {
      validator: function(val) {
        return val === null || (val < this.price && val !== undefined);
      },
      message: 'Giá khuyến mãi ({VALUE}) phải thấp hơn giá gốc'
    },
    default: null
  },
  coverImage: {
    type: String,
    default: 'default-book.jpg'
  },
  images: [String],
  categories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Vui lòng chọn ít nhất một danh mục']
  }],
  authors: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Author',
    required: [true, 'Vui lòng chọn ít nhất một tác giả']
  }],
  publisher: {
    type: mongoose.Schema.ObjectId,
    ref: 'Publisher',
    required: [true, 'Vui lòng chọn nhà xuất bản']
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Năm xuất bản không hợp lệ'],
    max: [new Date().getFullYear(), 'Năm xuất bản không thể ở tương lai']
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng cung cấp số lượng tồn kho'],
    min: [0, 'Số lượng tồn kho không thể là số âm'],
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0 // Thêm trường views để theo dõi lượt xem
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create text index for search (tìm kiếm toàn văn)
bookSchema.index({ title: 'text', description: 'text' });

// Middleware: Create slug from title before saving
bookSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, { lower: true, locale: 'vi' });
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);