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

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建新用户
      const userId = await MySQLUser.create({ username, password: hashedPassword });
      console.log('新用户 ID:', userId);

      // 生成 token
      const token = generateToken(userId, username);

      res.status(201).json({ token });

      // 获取所有用户信息
      const users = await MySQLUser.findAll();
      res.status(200).json(users);

    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ message: '获取用户信息失败', error: error.message });
        if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ message: '用户名已存在' });
      } else {
        res.status(500).json({ message: '注册失败', error: error.message });
      }
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
    console.log('用户密码:', user.password); // 打印数据库中的密码
    console.log('输入密码:', password); // 打印用户输入的密码
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('密码匹配结果:', isMatch); // 打印密码匹配结果

    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }

      // 生成 token
      const token = generateToken(user.id, user.username);

      res.json({ token });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ message: '登录失败', error: error.message });
    }
  }
}

module.exports = AuthController;