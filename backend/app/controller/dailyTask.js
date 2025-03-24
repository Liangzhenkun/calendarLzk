const { Controller } = require('egg');

class DailyTaskController extends Controller {
  // 获取用户日常任务
  async getDailyTasks() {
    const { ctx, service } = this;
    try {
      const userId = ctx.state.user.id;
      const tasks = await service.dailyTask.getUserDailyTasks(userId);
      ctx.body = {
        code: 0,
        message: '获取日常任务成功',
        data: tasks
      };
    } catch (error) {
      ctx.logger.error('获取日常任务失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '获取日常任务失败',
        data: null
      };
    }
  }

  // 完成任务
  async completeTask() {
    const { ctx, service } = this;
    const { taskId } = ctx.request.body;
    
    if (!taskId) {
      ctx.body = {
        code: 1,
        message: '缺少任务ID',
        data: null
      };
      return;
    }
    
    try {
      const userId = ctx.state.user.id;
      const result = await service.dailyTask.completeTask(userId, taskId);
      ctx.body = {
        code: 0,
        message: '完成任务成功',
        data: result
      };
    } catch (error) {
      ctx.logger.error('完成任务失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '完成任务失败',
        data: null
      };
    }
  }

  // 获取任务历史
  async getTaskHistory() {
    const { ctx, service } = this;
    try {
      const userId = ctx.state.user.id;
      const history = await service.dailyTask.getTaskHistory(userId);
      ctx.body = {
        code: 0,
        message: '获取任务历史成功',
        data: history
      };
    } catch (error) {
      ctx.logger.error('获取任务历史失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '获取任务历史失败',
        data: null
      };
    }
  }
}

module.exports = DailyTaskController; 