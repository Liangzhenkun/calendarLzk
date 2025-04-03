const Service = require('egg').Service;
const bcrypt = require('bcryptjs');

class UserService extends Service {
    // 查找用户
    async findOne({ username }) {
        const { app } = this;
        try {
            this.ctx.logger.info('开始查找用户:', { username });
            
            // 添加 SQL 查询日志
            const sql = `SELECT * FROM user WHERE username = ?`;
            this.ctx.logger.info('执行 SQL 查询:', { sql, params: [username] });
            
            const user = await app.mysql.get('user', { username });
            
            this.ctx.logger.info('查找用户结果:', { 
                username, 
                found: !!user,
                userDetails: user ? {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    hasPasswordHash: !!user.password_hash
                } : null
            });
            
            if (!user) {
                this.ctx.logger.warn('用户不存在:', { username });
            }
            
            return user;
        } catch (error) {
            this.ctx.logger.error('查询用户失败:', {
                error: error.message,
                stack: error.stack,
                sql: error.sql
            });
            throw error;
        }
    }

    // 创建用户
    async create({ username, password, email }) {
        const { app } = this;
        try {
            this.ctx.logger.info('开始创建用户:', { username, email });
            const hashedPassword = await bcrypt.hash(password, 10);
            this.ctx.logger.info('密码加密完成');
            
            const result = await app.mysql.insert('user', {
                username,
                email,
                password_hash: hashedPassword,
                avatar_url: null,
                refresh_token: null,
                points: 0,
                created_at: app.mysql.literals.now,
                updated_at: app.mysql.literals.now
            });
            
            this.ctx.logger.info('用户创建成功:', { 
                id: result.insertId,
                affectedRows: result.affectedRows
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
            this.ctx.logger.info('开始验证密码');
            
            if (!hashedPassword) {
                this.ctx.logger.error('数据库中没有存储密码哈希');
                return false;
            }
            
            const result = await bcrypt.compare(password, hashedPassword);
            this.ctx.logger.info('密码验证结果:', { isValid: result });
            return result;
        } catch (error) {
            this.ctx.logger.error('密码验证失败:', error);
            throw error;
        }
    }

    // 获取所有用户
    async findAll() {
        const { app } = this;
        try {
            const users = await app.mysql.select('user', {
                columns: ['id', 'username', 'email', 'avatar_url', 'points', 'created_at', 'updated_at']
            });
            return users;
        } catch (error) {
            this.ctx.logger.error('获取所有用户失败:', error);
            throw error;
        }
    }

    // 添加积分
    async addPoints(userId, points) {
        const { app } = this;
        try {
            this.ctx.logger.info('开始添加积分:', { userId, points });
            
            // 获取用户当前积分
            const user = await app.mysql.get('user', { id: userId });
            if (!user) {
                throw new Error('用户不存在');
            }

            const currentPoints = user.points || 0;
            const newPoints = currentPoints + points;

            // 更新用户积分
            const result = await app.mysql.update('user', {
                points: newPoints,
                updated_at: app.mysql.literals.now
            }, {
                where: { id: userId }
            });

            this.ctx.logger.info('积分更新成功:', {
                userId,
                oldPoints: currentPoints,
                addedPoints: points,
                newPoints,
                affectedRows: result.affectedRows
            });

            // 记录积分历史
            await app.mysql.insert('points_history', {
                user_id: userId,
                points: points,
                type: 'earned',
                description: '完成任务获得积分',
                created_at: app.mysql.literals.now
            });

            return {
                oldPoints: currentPoints,
                addedPoints: points,
                newPoints
            };
        } catch (error) {
            this.ctx.logger.error('添加积分失败:', error);
            throw error;
        }
    }

    // 获取用户积分历史
    async getPointsHistory(userId) {
        const { app } = this;
        try {
            const history = await app.mysql.select('points_history', {
                where: { user_id: userId },
                orders: [['created_at', 'desc']],
                limit: 50
            });

            return history;
        } catch (error) {
            this.ctx.logger.error('获取积分历史失败:', error);
            throw error;
        }
    }

    // 获取用户统计信息
    async getUserStats(userId) {
        const { app } = this;
        try {
            const user = await app.mysql.get('user', { id: userId });
            if (!user) {
                throw new Error('用户不存在');
            }

            // 获取任务完成统计
            const taskStats = await this.service.dailyTask.getTaskStats(userId);

            // 获取成就统计
            const achievements = await this.service.achievement.getUserAchievements(userId);
            const completedAchievements = achievements.filter(a => a.completed).length;

            return {
                points: user.points || 0,
                taskStats,
                achievementsCompleted: completedAchievements,
                totalAchievements: achievements.length
            };
        } catch (error) {
            this.ctx.logger.error('获取用户统计信息失败:', error);
            throw error;
        }
    }
}

module.exports = UserService;