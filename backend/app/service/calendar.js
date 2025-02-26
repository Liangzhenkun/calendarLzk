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
    const { userId, date, content, mood = 3, tags = '' } = data;
    
    try {
      this.ctx.logger.info('创建/更新日历记录，数据:', data);
      
      // 查找是否存在记录
      const existing = await app.mysql.get('CalendarRecord', { userId, date });

      if (existing) {
        // 更新记录
        const updateData = {
          content,
          mood,
          tags,
          updatedAt: app.mysql.literals.now
        };
        
        this.ctx.logger.info('更新已存在的记录:', { id: existing.id, updateData });
        
        await app.mysql.update('CalendarRecord', updateData, {
          where: { id: existing.id }
        });
        return { ...existing, ...updateData };
      }

      // 创建新记录
      const insertData = {
        userId,
        date,
        content,
        mood,
        tags,
        createdAt: app.mysql.literals.now,
        updatedAt: app.mysql.literals.now
      };
      
      this.ctx.logger.info('创建新记录:', insertData);
      
      const result = await app.mysql.insert('CalendarRecord', insertData);
      return { ...insertData, id: result.insertId };
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
}

module.exports = CalendarService; 