const MySQLUser = require('../models/MySQLUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成 JWT Token 的工具函数
const generateToken = (userId, username) => {
  return jwt.sign(
    { id: userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

class AuthController {
  static async register(req, res) {
    try {
      const { username, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await MySQLUser.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // 创建新用户
      const userId = await MySQLUser.create({ username, password });

      // 生成 token
      const token = jwt.sign(
        { id: userId, username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ 
        token,
        userId, // 添加 userId 到响应中
        message: '注册成功' 
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ message: '注册失败', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await MySQLUser.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: '用户不存在' });
      }

      // 验证密码
      const isMatch = await MySQLUser.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '密码错误' });
      }

      // 生成 token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        token,
        userId: user.id, // 添加 userId 到响应中
        message: '登录成功' 
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ message: '登录失败', error: error.message });
    }
  }
}

module.exports = AuthController;