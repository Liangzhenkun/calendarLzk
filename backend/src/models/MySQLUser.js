const mysql = require('mysql2/promise');

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
          console.log('查询结果:', rows); // 打印查询结果
          return rows[0]; // 返回第一个匹配的用户
        } catch (error) {
          console.error('查询用户失败:', error);
          throw error;
        }

    static async create({ username, password }) {
        try {
          const [result] = await db.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, password]);
          console.log('插入结果:', result); // 打印插入结果
          return result.insertId; // 返回插入的用户 ID
        } catch (error) {
          console.error('插入用户失败:', error);
          throw error;
        }

    // 验证密码
    static async comparePassword(user, candidatePassword) {
        return bcrypt.compare(candidatePassword, user.password);
    }

    
}

module.exports = MySQLUser;