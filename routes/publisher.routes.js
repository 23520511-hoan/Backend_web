// routes/publisher.routes.js
const express = require('express');
const router = express.Router();
const {
  getPublishers,
  getPublisher,
  createPublisher,
  updatePublisher,
  deletePublisher
} = require('../controllers/publisher.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validatePublisherCreate, validatePublisherUpdate } = require('../middleware/validate');

router.get('/', getPublishers); // Public
router.get('/:id', getPublisher); // Public
router.post('/', protect, authorize('admin'), validatePublisherCreate, createPublisher); // Admin
router.put('/:id', protect, authorize('admin'), validatePublisherUpdate, updatePublisher); // Admin
router.delete('/:id', protect, authorize('admin'), deletePublisher); // Admin

module.exports = router;