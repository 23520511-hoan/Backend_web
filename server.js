// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Chỉ cho phép origin đã định nghĩa
  credentials: true,
  optionsSuccessStatus: 200 // Một số trình duyệt cũ yêu cầu status 200
}));
app.use(express.json()); // Cho phép server đọc dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Cho phép server đọc dữ liệu từ form
app.use(morgan('dev')); // Logging request

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Thoát nếu kết nối thất bại
  });

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/authors', require('./routes/author.routes'));
app.use('/api/publishers', require('./routes/publisher.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// API Documentation Home
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Readly API',
    version: '1.0.0',
    documentation: '/api-docs', // Nếu có sử dụng Swagger
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      books: '/api/books',
      categories: '/api/categories',
      authors: '/api/authors',
      publishers: '/api/publishers',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1); // Thoát nếu không khởi động được server
});