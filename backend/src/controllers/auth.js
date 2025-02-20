const MySQLUser = require('../models/MySQLUser'); // MySQL 用户模型
const MongoUser = require('../models/User'); // MongoDB 用户模型
const jwt = require('jsonwebtoken');

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
      console.log('新用户 ID:', userId); // 打印新用户 ID

      // 生成 token
      const token = jwt.sign(
        { id: userId, username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ token });
    } catch (error) {
      console.error('注册错误:', error); // 打印详细错误信息
      res.status(500).json({ message: '注册失败', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await MongoUser.findOne({ username });
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