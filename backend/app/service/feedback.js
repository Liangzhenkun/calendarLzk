const Service = require('egg').Service;

class FeedbackService extends Service {
  async create(data) {
    const { app } = this;
    try {
      // 创建反馈记录
      const result = await app.mysql.insert('feedback', {
        email: data.email,
        type: data.type,
        content: data.content,
        user_id: data.user_id || null,
        created_at: app.mysql.literals.now,
      });
      
      return { id: result.insertId };
    } catch (error) {
      this.ctx.logger.error('创建反馈记录失败:', error);
      throw error;
    }
  }
  
  async list(page = 1, pageSize = 20) {
    const { app } = this;
    try {
      const offset = (page - 1) * pageSize;
      
      // 获取反馈列表
      const list = await app.mysql.query(`
        SELECT f.*, u.username 
        FROM feedback f
        LEFT JOIN user u ON f.user_id = u.id
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `, [pageSize, offset]);
      
      // 获取总数
      const countResult = await app.mysql.query('SELECT COUNT(*) as total FROM feedback');
      const total = countResult[0].total;
      
      return {
        list,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.ctx.logger.error('获取反馈列表失败:', error);
      throw error;
    }
  }
}

module.exports = FeedbackService; 