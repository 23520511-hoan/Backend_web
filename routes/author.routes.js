// routes/author.routes.js
const express = require('express');
const router = express.Router();
const {
  getAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/author.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateAuthorCreate, validateAuthorUpdate } = require('../middleware/validate');

router.get('/', getAuthors); // Public
router.get('/:id', getAuthor); // Public
router.post('/', protect, authorize('admin'), validateAuthorCreate, createAuthor); // Admin
router.put('/:id', protect, authorize('admin'), validateAuthorUpdate, updateAuthor); // Admin
router.delete('/:id', protect, authorize('admin'), deleteAuthor); // Admin

module.exports = router;