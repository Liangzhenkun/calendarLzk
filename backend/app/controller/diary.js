const { Controller } = require('egg');

class DiaryController extends Controller {
  async create() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const data = { ...ctx.request.body, userId };

    try {
      ctx.logger.info('创建日记，接收到的数据:', data);
      const result = await service.diary.create(data);
      ctx.logger.info('日记创建成功:', result);
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('创建日记失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  async list() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;

    try {
      ctx.logger.info('获取用户日记列表, userId:', userId);
      const diaries = await service.diary.list(userId);
      ctx.logger.info('获取到日记数量:', diaries.length);
      ctx.body = diaries;
    } catch (error) {
      ctx.logger.error('获取日记列表失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  async getByDate() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;

    try {
      ctx.logger.info('按日期获取日记, userId:', userId, 'date:', date);
      const diary = await service.diary.getByDate(userId, date);
      if (!diary) {
        ctx.status = 404;
        ctx.body = { message: '该日期没有日记' };
        return;
      }
      ctx.body = diary;
    } catch (error) {
      ctx.logger.error('获取日记失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  async update() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;
    const data = ctx.request.body;

    try {
      ctx.logger.info('更新日记, userId:', userId, 'date:', date, 'data:', data);
      const result = await service.diary.updateByDate(userId, date, data);
      if (!result) {
        ctx.status = 404;
        ctx.body = { message: '日记不存在' };
        return;
      }
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('更新日记失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  async delete() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;

    try {
      ctx.logger.info('删除日记, userId:', userId, 'date:', date);
      const result = await service.diary.deleteByDate(userId, date);
      if (!result) {
        ctx.status = 404;
        ctx.body = { message: '日记不存在' };
        return;
      }
      ctx.body = { success: true };
    } catch (error) {
      ctx.logger.error('删除日记失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }
}

module.exports = DiaryController; 