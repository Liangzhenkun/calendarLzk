'use strict';

const Controller = require('egg').Controller;

class CalendarController extends Controller {
  async getRecords() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;

    try {
      ctx.logger.info('获取日历记录, userId:', userId);
      const records = await service.calendar.getRecords(userId);
      ctx.logger.info('获取到记录数量:', records.length);
      ctx.body = records;
    } catch (error) {
      ctx.logger.error('获取日历记录失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message || '获取记录失败' };
    }
  }

  async createOrUpdate() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const data = { ...ctx.request.body, userId };

    try {
      // 验证必要字段
      const { date, content } = data;
      if (!date) {
        ctx.status = 400;
        ctx.body = { message: '日期不能为空' };
        return;
      }
      if (!content) {
        ctx.status = 400;
        ctx.body = { message: '内容不能为空' };
        return;
      }

      ctx.logger.info('创建/更新日历记录, userId:', userId, 'data:', data);
      const result = await service.calendar.createOrUpdate(data);
      ctx.logger.info('创建/更新成功:', result);
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('创建/更新日历记录失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message || '保存失败' };
    }
  }
}

module.exports = CalendarController; 