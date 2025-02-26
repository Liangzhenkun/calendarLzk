const { Controller } = require('egg');

class CalendarController extends Controller {
  async getRecords() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;

    try {
      const records = await service.calendar.getRecords(userId);
      ctx.body = records;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  async createOrUpdate() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const data = { ...ctx.request.body, userId };

    try {
      const result = await service.calendar.createOrUpdate(data);
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }
}

module.exports = CalendarController; 