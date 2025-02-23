const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 假设您有一个 User 模型
const bcrypt = require('bcrypt'); // 用于密码哈希

// 注册路由
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请稍后再试' });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 登录成功
    res.json({ message: '登录成功' });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败，请稍后再试' });
  }
});

module.exports = router;