// controllers/user.controller.js
const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Chỉ lấy các trường an toàn
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin người dùng', error: error.message });
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    // Trả về thông tin user không bao gồm password
    const safeUser = user.toObject();
    delete safeUser.password;
    
    res.status(201).json({ success: true, message: 'Tạo người dùng thành công', data: safeUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }
    res.status(500).json({ success: false, message: 'Lỗi khi tạo người dùng', error: error.message });
  }
};

// @desc    Update user profile (User self-update)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      avatar: req.body.avatar
    };

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật hồ sơ', error: error.message });
  }
};

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Không cho phép admin tự thay đổi password và token của user qua route này
    const { password, resetPasswordToken, resetPasswordExpire, ...updates } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật người dùng', error: error.message });
  }
};

// @desc    Delete user by ID (Soft Delete - Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Xóa người dùng thành công (khóa tài khoản)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng', error: error.message });
  }
};