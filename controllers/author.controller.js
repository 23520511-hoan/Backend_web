// controllers/author.controller.js
const Author = require('../models/Author');

exports.getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const authors = await Author.find(query).sort('name').skip(skip).limit(Number(limit));
    const total = await Author.countDocuments(query);

    res.status(200).json({
      success: true,
      data: authors,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy tác giả', error: error.message });
  }
};

exports.getAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả' });
    }
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy tác giả', error: error.message });
  }
};

exports.createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo tác giả thành công', data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo tác giả', error: error.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!author) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả' });
    }
    res.status(200).json({ success: true, message: 'Cập nhật tác giả thành công', data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật tác giả', error: error.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả' });
    }
    author.isActive = false;
    await author.save();
    res.status(200).json({ success: true, message: 'Xóa tác giả thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa tác giả', error: error.message });
  }
};