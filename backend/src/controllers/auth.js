const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
  static async register(req, res) {
    try {
      const { username, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // 创建新用户
      const user = new User({ username, password });
      await user.save();

      // 生成 token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ message: '注册失败' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: '用户名或密码错误' });
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: '用户名或密码错误' });
      }

      // 生成 token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: '登录失败' });
    }
  }
}

module.exports = AuthController; 