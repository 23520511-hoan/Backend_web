// middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
    let error = { ...err, message: err.message };
  
    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      error = {
        message: `ID không hợp lệ: ${err.value}`,
        statusCode: 400
      };
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      error = {
        message: `Trùng lặp dữ liệu: ${field} (${value}) đã tồn tại`,
        statusCode: 400
      };
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message).join(', ');
      error = {
        message: `Dữ liệu không hợp lệ: ${messages}`,
        statusCode: 400
      };
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = {
        message: 'Token không hợp lệ',
        statusCode: 401
      };
    }
  
    // JWT expired
    if (err.name === 'TokenExpiredError') {
      error = {
        message: 'Token đã hết hạn',
        statusCode: 401
      };
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;