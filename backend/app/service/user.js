const Service = require('egg').Service;
const bcrypt = require('bcryptjs');

class UserService extends Service {
    // 查找用户
    async findOne({ username }) {
        const { app } = this;
        try {
            const user = await app.mysql.get('User', { username });
            return user;
        } catch (error) {
            this.ctx.logger.error('查询用户失败:', error);
            throw error;
        }
    }

    // 创建用户
    async create({ username, password }) {
        const { app } = this;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await app.mysql.insert('User', {
                username,
                password: hashedPassword
            });
            return result.insertId;
        } catch (error) {
            this.ctx.logger.error('创建用户失败:', error);
            throw error;
        }
    }

    // 验证密码
    async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            this.ctx.logger.error('密码验证失败:', error);
            throw error;
        }
    }

    // 获取所有用户
    async findAll() {
        const { app } = this;
        try {
            const users = await app.mysql.select('User', {
                columns: ['id', 'username', 'createdAt']
            });
            return users;
        } catch (error) {
            this.ctx.logger.error('获取所有用户失败:', error);
            throw error;
        }
    }
}

module.exports = UserService; 