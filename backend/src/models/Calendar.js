const pool = require('../config/database');

class Calendar {
    static async create(data) {
        const { userId, date, content, mood = 'normal', tags = '' } = data;
        try {
            const [result] = await pool.query(
                `INSERT INTO Calendar (userId, date, content, mood, tags) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, date, content, mood, tags]
            );
            return result.insertId;
        } catch (error) {
            console.error('创建日历记录失败:', error);
            throw error;
        }
    }

    static async findByUserAndDate(userId, date) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM Calendar WHERE userId = ? AND date = ?',
                [userId, date]
            );
            return rows[0];
        } catch (error) {
            console.error('查询日历记录失败:', error);
            throw error;
        }
    }

    static async update(id, data) {
        const { content, mood, tags } = data;
        try {
            const [result] = await pool.query(
                `UPDATE Calendar 
                 SET content = ?, mood = ?, tags = ?
                 WHERE id = ?`,
                [content, mood, tags, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('更新日历记录失败:', error);
            throw error;
        }
    }
}

module.exports = Calendar; 