// routes/book.routes.js
const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getFeaturedBooks,
  getBestsellers
} = require('../controllers/book.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateBookCreate, validateBookUpdate } = require('../middleware/validate');

router.get('/', getBooks); // Public - Get all books with search/filter
router.get('/featured', getFeaturedBooks); // Public - Get featured books
router.get('/bestsellers', getBestsellers); // Public - Get bestsellers
router.get('/:id', getBook); // Public - Get single book

// Admin routes
router.post('/', protect, authorize('admin'), validateBookCreate, createBook); 
router.put('/:id', protect, authorize('admin'), validateBookUpdate, updateBook); 
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;