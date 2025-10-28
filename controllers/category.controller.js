// controllers/category.controller.js
const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh mục', error: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh mục', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật danh mục', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    category.isActive = false;
    await category.save();
    res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa danh mục', error: error.message });
  }
};