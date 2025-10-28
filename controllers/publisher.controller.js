// controllers/publisher.controller.js
const Publisher = require('../models/Publisher');

exports.getPublishers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const publishers = await Publisher.find(query).sort('name').skip(skip).limit(Number(limit));
    const total = await Publisher.countDocuments(query);

    res.status(200).json({
      success: true,
      data: publishers,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy nhà xuất bản', error: error.message });
  }
};

exports.getPublisher = async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà xuất bản' });
    }
    res.status(200).json({ success: true, data: publisher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy nhà xuất bản', error: error.message });
  }
};

exports.createPublisher = async (req, res) => {
  try {
    const publisher = await Publisher.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo nhà xuất bản thành công', data: publisher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo nhà xuất bản', error: error.message });
  }
};

exports.updatePublisher = async (req, res) => {
  try {
    const publisher = await Publisher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!publisher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà xuất bản' });
    }
    res.status(200).json({ success: true, message: 'Cập nhật nhà xuất bản thành công', data: publisher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật nhà xuất bản', error: error.message });
  }
};

exports.deletePublisher = async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà xuất bản' });
    }
    publisher.isActive = false;
    await publisher.save();
    res.status(200).json({ success: true, message: 'Xóa nhà xuất bản thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa nhà xuất bản', error: error.message });
  }
};