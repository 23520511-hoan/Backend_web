// seeder.js - Import sample data
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify'); // Thêm slugify để tạo slug

// 💡 Đảm bảo import từng Model từ file riêng của nó
const User = require('./models/User');
const Book = require('./models/Book');
const Category = require('./models/Category');
const Author = require('./models/Author');
const Publisher = require('./models/Publisher');
// Import Cart và Order từ object export
const { Cart } = require('./models/Cart');
const { Order } = require('./models/Order');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Seeder connected to MongoDB...'))
  .catch(err => {
    console.error('Seeder connection error:', err);
    process.exit(1); // Thoát nếu kết nối thất bại
  });

const importData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany();
    await Book.deleteMany();
    await Category.deleteMany();
    await Author.deleteMany();
    await Publisher.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    console.log('Data Cleared...');

    // 2. Create Admin and User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@readly.com',
      password: 'admin123',
      role: 'admin'
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@readly.com',
      password: 'user123',
      phone: '0901234567'
    });

    console.log('✅ Users Created');

    // 3. Create Categories
    const categories = await Category.insertMany([
      { name: 'Văn học', slug: slugify('Văn học', { lower: true }) },
      { name: 'Kinh tế', slug: slugify('Kinh tế', { lower: true }) },
      { name: 'Tâm lý - Kỹ năng sống', slug: slugify('Tâm lý - Kỹ năng sống', { lower: true }) },
      { name: 'Thiếu nhi', slug: slugify('Thiếu nhi', { lower: true }) },
      { name: 'Khoa học công nghệ', slug: slugify('Khoa học công nghệ', { lower: true }) },
      { name: 'Lịch sử', slug: slugify('Lịch sử', { lower: true }) },
      { name: 'Triết học', slug: slugify('Triết học', { lower: true }) },
      { name: 'Ngoại ngữ', slug: slugify('Ngoại ngữ', { lower: true }) }
    ]);

    console.log('✅ Categories Created');

    // 4. Create Authors
    const authors = await Author.insertMany([
      { name: 'Nguyễn Nhật Ánh', biography: 'Nhà văn nổi tiếng Việt Nam', nationality: 'Việt Nam' },
      { name: 'Tô Hoài', biography: 'Nhà văn lão thành', nationality: 'Việt Nam' },
      { name: 'Paulo Coelho', biography: 'Nhà văn Brazil nổi tiếng', nationality: 'Brazil' },
      { name: 'Dale Carnegie', biography: 'Chuyên gia phát triển bản thân', nationality: 'Mỹ' },
      { name: 'Robert Kiyosaki', biography: 'Tác giả "Cha giàu cha nghèo"', nationality: 'Mỹ' }
    ]);

    console.log('✅ Authors Created');

    // 5. Create Publishers
    const publishers = await Publisher.insertMany([
      { 
        name: 'Nhà Xuất Bản Trẻ', 
        address: { 
          city: 'TP. Hồ Chí Minh', 
          country: 'Việt Nam' 
        } 
      },
      { 
        name: 'NXB Kim Đồng', 
        address: { 
          city: 'Hà Nội', 
          country: 'Việt Nam' 
        } 
      },
      { 
        name: 'NXB Tổng hợp TP.HCM', 
        address: { 
          city: 'TP. Hồ Chí Minh', 
          country: 'Việt Nam' 
        } 
      },
      { 
        name: 'NXB Lao Động', 
        address: { 
          city: 'Hà Nội', 
          country: 'Việt Nam' 
        } 
      }
    ]);

    console.log('✅ Publishers Created');

    // 6. Create Books (Sử dụng ID đã tạo)
    const [vh, kt, tlkn, tn] = categories.slice(0, 4).map(c => c._id);
    const [nna, th, pc, dc, rk] = authors.map(a => a._id);
    const [nxb_tre, nxb_kimdong, nxb_tphcm, nxb_laodong] = publishers.map(p => p._id);

    await Book.insertMany([
      {
        title: 'Mắt Biếc',
        slug: slugify('Mắt Biếc', { lower: true }),
        description: 'Câu chuyện tình yêu tuổi học trò trong sáng nhưng đầy day dứt.',
        price: 100000,
        discountPrice: 85000,
        coverImage: 'mat-biec.jpg',
        categories: [vh],
        authors: [nna],
        publisher: nxb_tre,
        publishedYear: 2019,
        stock: 50,
        soldCount: 120,
        isFeatured: true,
      },
      {
        title: 'Dế Mèn Phiêu Lưu Ký',
        slug: slugify('Dế Mèn Phiêu Lưu Ký', { lower: true }),
        description: 'Tác phẩm văn học thiếu nhi kinh điển của Việt Nam.',
        price: 55000,
        coverImage: 'de-men.jpg',
        categories: [vh, tn],
        authors: [th],
        publisher: nxb_kimdong,
        publishedYear: 2015,
        stock: 80,
        soldCount: 250,
        isFeatured: true,
      },
      {
        title: 'Nhà Giả Kim',
        slug: slugify('Nhà Giả Kim', { lower: true }),
        description: 'Cuốn tiểu thuyết nổi tiếng thế giới về hành trình đi tìm kho báu.',
        price: 90000,
        discountPrice: 79000,
        coverImage: 'nha-gia-kim.jpg',
        categories: [tlkn, vh],
        authors: [pc],
        publisher: nxb_laodong,
        publishedYear: 2020,
        stock: 60,
        soldCount: 300,
        isFeatured: true,
        rating: 4.8,
        numReviews: 150
      },
      {
        title: 'Đắc Nhân Tâm',
        slug: slugify('Đắc Nhân Tâm', { lower: true }),
        description: 'Nghệ thuật giao tiếp và đối nhân xử thế kinh điển.',
        price: 120000,
        coverImage: 'dac-nhan-tam.jpg',
        categories: [tlkn],
        authors: [dc],
        publisher: nxb_tphcm,
        publishedYear: 2018,
        stock: 100,
        soldCount: 500,
        isFeatured: true,
        rating: 4.9,
        numReviews: 200
      },
      {
        title: 'Cha Giàu Cha Nghèo',
        slug: slugify('Cha Giàu Cha Nghèo', { lower: true }),
        description: 'Bài học về quản lý tài chính cá nhân và đầu tư.',
        price: 150000,
        discountPrice: 135000,
        coverImage: 'cha-giau-cha-ngheo.jpg',
        categories: [kt],
        authors: [rk],
        publisher: nxb_laodong,
        publishedYear: 2017,
        stock: 45,
        soldCount: 400,
      },
      {
        title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
        slug: slugify('Cho Tôi Xin Một Vé Đi Tuổi Thơ', { lower: true }),
        description: 'Một cuốn sách đầy hoài niệm về tuổi thơ tinh nghịch.',
        price: 80000,
        coverImage: 'tuoi-tho.jpg',
        categories: [vh, tn],
        authors: [nna],
        publisher: nxb_tre,
        publishedYear: 2011,
        stock: 70,
        soldCount: 150,
      },
      {
        title: 'Bí Mật Của May Mắn',
        slug: slugify('Bí Mật Của May Mắn', { lower: true }),
        description: 'Cuốn sách ngắn gọn, truyền cảm hứng về cách tạo ra vận may.',
        price: 65000,
        discountPrice: 59000,
        coverImage: 'may-man.jpg',
        categories: [tlkn],
        authors: [pc],
        publisher: nxb_tphcm,
        publishedYear: 2016,
        stock: 55,
        soldCount: 90,
      },
    ]);

    console.log('✅ Books Created');
    console.log('🎉 Data Imported Successfully!');
    process.exit(0); // Thoát thành công
  } catch (error) {
    console.error('❌ Error with data import:', error);
    if (error.name === 'MissingSchemaError') {
      console.error('⚠️ LƯU Ý: Lỗi có thể do bạn chưa export Model đúng cách trong các file Model (Category, Author, Publisher) hoặc chưa tạo file Models.');
    }
    process.exit(1); // Thoát với mã lỗi
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    await Category.deleteMany();
    await Author.deleteMany();
    await Publisher.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    console.log('🗑️ Data Destroyed Successfully!');
    process.exit(0); // Thoát thành công
  } catch (error) {
    console.error('❌ Error with data destroy:', error);
    process.exit(1); // Thoát với mã lỗi
  }
};

// Lệnh chạy: node seeder.js -d để xóa dữ liệu, hoặc node seeder.js để nhập dữ liệu
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}