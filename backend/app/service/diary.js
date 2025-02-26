const Service = require('egg').Service;

class DiaryService extends Service {
  async create(data) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('Diary', {
        ...data,
        createdAt: app.mysql.literals.now,
        updatedAt: app.mysql.literals.now
      });
      return { ...data, id: result.insertId };
    } catch (error) {
      this.ctx.logger.error('创建日记失败:', error);
      throw error;
    }
  }

  async list(userId) {
    const { app } = this;
    try {
      return await app.mysql.select('Diary', {
        where: { userId },
        orders: [['createdAt', 'desc']]
      });
    } catch (error) {
      this.ctx.logger.error('获取日记列表失败:', error);
      throw error;
    }
  }

  async detail(userId, id) {
    const { app } = this;
    try {
      return await app.mysql.get('Diary', { id, userId });
    } catch (error) {
      this.ctx.logger.error('获取日记详情失败:', error);
      throw error;
    }
  }

  async update(userId, id, data) {
    const { app } = this;
    try {
      const result = await app.mysql.update('Diary', {
        ...data,
        updatedAt: app.mysql.literals.now
      }, {
        where: { id, userId }
      });
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('更新日记失败:', error);
      throw error;
    }
  }

  async delete(userId, id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('Diary', {
        id,
        userId
      });
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('删除日记失败:', error);
      throw error;
    }
  }
}

module.exports = DiaryService; 