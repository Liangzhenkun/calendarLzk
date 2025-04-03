const Controller = require('egg').Controller;

class DailyTaskController extends Controller {
  // 获取每日任务列表
  async getDailyTasks() {
    const { ctx } = this;
    ctx.body = [];
  }

  // 完成任务
  async completeTask() {
    const { ctx } = this;
    ctx.body = { success: true };
  }

  // 获取任务历史记录
  async getTaskHistory() {
    const { ctx } = this;
    ctx.body = [];
  }
}

module.exports = DailyTaskController; 