const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.register(username, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 验证token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('未提供token');
    }
    
    const user = await authService.verifyToken(token);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router; 