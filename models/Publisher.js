// models/Publisher.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String
}, { _id: false });

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a publisher name'],
    unique: true,
    trim: true,
    maxlength: [150, 'Publisher name cannot be more than 150 characters'],
    index: true // Thêm index để tối ưu hóa tìm kiếm
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  foundedYear: {
    type: Number
  },
  country: {
    type: String
  },
  logo: {
    type: String,
    default: 'default-publisher.jpg'
  },
  website: {
    type: String
  },
  email: {
    type: String,
    lowercase: true
  },
  phone: {
    type: String
  },
  address: addressSchema,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Publisher', publisherSchema);