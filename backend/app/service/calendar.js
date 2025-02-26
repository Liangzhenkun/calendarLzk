const Service = require('egg').Service;

class CalendarService extends Service {
  async getRecords(userId) {
    return await this.app.mysql.select('CalendarRecord', {
      where: { userId },
      orders: [['date', 'desc']]
    });
  }

  async createOrUpdate(data) {
    const { userId, date } = data;
    const existing = await this.app.mysql.get('CalendarRecord', { userId, date });

    if (existing) {
      // 更新记录
      await this.app.mysql.update('CalendarRecord', {
        ...data,
        updatedAt: this.app.mysql.literals.now
      }, {
        where: { id: existing.id }
      });
      return { ...existing, ...data };
    }

    // 创建新记录
    const result = await this.app.mysql.insert('CalendarRecord', {
      ...data,
      createdAt: this.app.mysql.literals.now
    });
    return { ...data, id: result.insertId };
  }

  async deleteRecord(userId, recordId) {
    const result = await this.app.mysql.delete('CalendarRecord', {
      id: recordId,
      userId
    });
    return result.affectedRows > 0;
  }
}

module.exports = CalendarService; 