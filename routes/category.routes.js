// routes/category.routes.js
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateCategoryCreate, validateCategoryUpdate } = require('../middleware/validate');

router.get('/', getCategories); // Public
router.get('/:id', getCategory); // Public
router.post('/', protect, authorize('admin'), validateCategoryCreate, createCategory); // Admin
router.put('/:id', protect, authorize('admin'), validateCategoryUpdate, updateCategory); // Admin
router.delete('/:id', protect, authorize('admin'), deleteCategory); // Admin

module.exports = router;