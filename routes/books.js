const express = require('express');
const router = express.Router();
const { Book } = require('../database/collections');

// 获取所有书籍
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 搜索书籍
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 添加新书
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单本书籍详情
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: '未找到该书籍' });
        }
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 更新阅读进度
router.put('/:id/progress', async (req, res) => {
    try {
        const { currentPage, readingStatus } = req.body;
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { 
                currentPage, 
                readingStatus,
                updatedAt: new Date()
            },
            { new: true }
        );
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 添加笔记
router.post('/:id/notes', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    book.notes.push(req.body);
    await book.save();
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 