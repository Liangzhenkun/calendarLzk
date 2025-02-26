const Service = require('egg').Service;

class CalendarService extends Service {
  // 获取用户的所有日历记录
  async getRecords(userId) {
    const { app } = this;
    try {
      return await app.mysql.select('CalendarRecord', {
        where: { userId },
        orders: [['date', 'desc']]
      });
    } catch (error) {
      this.ctx.logger.error('获取日历记录失败:', error);
      throw error;
    }
  }

  // 创建或更新日历记录
  async createOrUpdate(data) {
    const { app } = this;
    const { userId, date } = data;
    
    try {
      // 查找是否存在记录
      const existing = await app.mysql.get('CalendarRecord', { userId, date });

      if (existing) {
        // 更新记录
        await app.mysql.update('CalendarRecord', {
          ...data,
          updatedAt: app.mysql.literals.now
        }, {
          where: { id: existing.id }
        });
        return { ...existing, ...data };
      }

      // 创建新记录
      const result = await app.mysql.insert('CalendarRecord', {
        ...data,
        createdAt: app.mysql.literals.now,
        updatedAt: app.mysql.literals.now
      });
      return { ...data, id: result.insertId };
    } catch (error) {
      this.ctx.logger.error('创建/更新日历记录失败:', error);
      throw error;
    }
  }

  // 删除日历记录
  async deleteRecord(userId, recordId) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('CalendarRecord', {
        id: recordId,
        userId
      });
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('删除日历记录失败:', error);
      throw error;
    }
  }

  // 根据日期范围获取记录
  async getRecordsByDateRange(userId, startDate, endDate) {
    const { app } = this;
    try {
      return await app.mysql.select('CalendarRecord', {
        where: {
          userId,
          date: {
            $between: [startDate, endDate]
          }
        },
        orders: [['date', 'asc']]
      });
    } catch (error) {
      this.ctx.logger.error('获取日期范围内的记录失败:', error);
      throw error;
    }
  }

  async create(data) {
    const { app } = this;
    const { userId, date, content, mood = 'normal', tags = '' } = data;
    try {
      const result = await app.mysql.insert('Calendar', {
        userId,
        date,
        content,
        mood,
        tags
      });
      return result.insertId;
    } catch (error) {
      this.ctx.logger.error('创建日历记录失败:', error);
      throw error;
    }
  }

  async findByUserAndDate(userId, date) {
    const { app } = this;
    try {
      const record = await app.mysql.get('Calendar', {
        userId,
        date
      });
      return record;
    } catch (error) {
      this.ctx.logger.error('查询日历记录失败:', error);
      throw error;
    }
  }

  async update(id, data) {
    const { app } = this;
    const { content, mood, tags } = data;
    try {
      const result = await app.mysql.update('Calendar', {
        content,
        mood,
        tags
      }, {
        where: { id }
      });
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('更新日历记录失败:', error);
      throw error;
    }
  }
}

module.exports = CalendarService; 