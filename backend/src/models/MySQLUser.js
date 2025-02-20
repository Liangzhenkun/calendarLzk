const mysql = require('mysql2/promise'); // 使用 promise 版本的 mysql2

// 创建 MySQL 连接
const db = mysql.createPool({
    host: 'localhost',
    user: 'Bruce',
    password: '123456lzk',
    database: 'calendar'
});

// 用户模型
class MySQLUser {
    static async findOne({ username }) {
        const [rows] = await db.query('SELECT * FROM User WHERE username = ?', [username]);
        return rows[0]; // 返回找到的用户
    }

    static async create({ username, password }) {
        const [result] = await db.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, password]);
        console.log('插入结果:', result); // 打印插入结果
        return result.insertId; // 返回插入的用户 ID
    }
}

module.exports = MySQLUser; 