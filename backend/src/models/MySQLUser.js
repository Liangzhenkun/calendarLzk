const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 创建 MySQL 连接
const db = mysql.createPool({
  host: 'localhost',
  user: 'Bruce',
  password: '123456lzk',
  database: 'calendar'
});

class MySQLUser {
  // 查找用户
  static async findOne({ username }) {
    try {
      const [rows] = await db.query('SELECT * FROM User WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  // 创建用户
  static async create({ username, password }) {
    try {
      const [result] = await db.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, password]);
      return result.insertId;
    } catch (error) {
      console.error('插入用户失败:', error);
      throw error;
    }
  }

  // 验证密码
  static async comparePassword(user, candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, user.password);
    } catch (error) {
      console.error('密码验证失败:', error);
      throw error;
    }
  }
}

module.exports = MySQLUser;