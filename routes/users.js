const express = require('express');
const router = express.Router();
const { User } = require('../database/collections');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 