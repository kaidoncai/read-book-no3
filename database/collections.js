const mongoose = require('mongoose');

// 书籍模式
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  cover: { type: String }, // 封面图片URL
  description: { type: String }, // 书籍简介
  category: { type: String }, // 分类
  readingStatus: { type: String, default: '未开始' },
  currentPage: { type: Number, default: 0 },
  totalPages: { type: Number },
  notes: [{ 
    content: String,
    page: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastReadDate: { type: Date },
  readingTime: { type: Number, default: 0 } // 总阅读时间（分钟）
});

// 用户模式
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  readingGoal: { type: Number, default: 100 }, // 年度阅读目标
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
  Book,
  User
}; 