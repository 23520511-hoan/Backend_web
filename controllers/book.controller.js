// controllers/book.controller.js
const Book = require('../models/Book');

// @desc    Get all books with filters, search, pagination
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      category, 
      author, 
      publisher,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      featured
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Search by title or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by author
    if (author) {
      query.authors = author;
    }

    // Filter by publisher
    if (publisher) {
      query.publisher = publisher;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter featured books
    if (featured) {
      query.isFeatured = featured === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const books = await Book.find(query)
      .populate('authors', 'name avatar')
      .populate('publisher', 'name logo')
      .populate('categories', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sách',
      error: error.message
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('authors', 'name biography avatar')
      .populate('publisher', 'name description logo')
      .populate('categories', 'name slug description');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    // Increment view count
    book.views += 1;
    await book.save();

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sách',
      error: error.message
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo sách thành công',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sách',
      error: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật sách thành công',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sách',
      error: error.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    // Soft delete - just set isActive to false
    book.isActive = false;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Xóa sách thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sách',
      error: error.message
    });
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
exports.getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.find({ isFeatured: true, isActive: true })
      .populate('authors', 'name')
      .populate('publisher', 'name')
      .limit(10)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sách nổi bật',
      error: error.message
    });
  }
};

// @desc    Get best selling books
// @route   GET /api/books/bestsellers
// @access  Public
exports.getBestsellers = async (req, res) => {
  try {
    const books = await Book.find({ isActive: true })
      .populate('authors', 'name')
      .populate('publisher', 'name')
      .sort('-soldCount')
      .limit(10);

    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sách bán chạy',
      error: error.message
    });
  }
};