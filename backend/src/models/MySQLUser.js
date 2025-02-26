const bcrypt = require('bcryptjs');
const pool = require('../config/database');

class MySQLUser {
    // 查找用户
    static async findOne({ username }) {
        try {
            const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
            return rows[0];
        } catch (error) {
            console.error('查询用户失败:', error);
            throw error;
        }
    }

    // 创建用户
    static async create({ username, password }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await pool.query(
                'INSERT INTO User (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );
            return result.insertId;
        } catch (error) {
            console.error('创建用户失败:', error);
            throw error;
        }
    }

    // 验证密码
    static async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('密码验证失败:', error);
            throw error;
        }
    }

    // 获取所有用户
    static async findAll() {
        try {
            const [rows] = await pool.query('SELECT id, username, createdAt FROM User');
            return rows;
        } catch (error) {
            console.error('获取所有用户失败:', error);
            throw error;
        }
    }
}

module.exports = MySQLUser; 