const { Controller } = require('egg');

class AchievementController extends Controller {
  // 获取所有成就
  async getAll() {
    const { ctx, service } = this;
    try {
      const achievements = await service.achievement.getAllAchievements();
      ctx.body = {
        code: 0,
        message: '获取成就列表成功',
        data: achievements
      };
    } catch (error) {
      ctx.logger.error('获取成就列表失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '获取成就列表失败',
        data: null
      };
    }
  }

  // 获取用户已解锁的成就
  async getUserAchievements() {
    const { ctx, service } = this;
    try {
      const userId = ctx.state.user.id;
      const achievements = await service.achievement.getUserAchievements(userId);
      ctx.body = {
        code: 0,
        message: '获取用户成就成功',
        data: achievements
      };
    } catch (error) {
      ctx.logger.error('获取用户成就失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '获取用户成就失败',
        data: null
      };
    }
  }

  // 检查成就进度
  async checkProgress() {
    const { ctx, service } = this;
    try {
      const userId = ctx.state.user.id;
      const result = await service.achievement.checkAchievements(userId);
      ctx.body = {
        code: 0,
        message: '检查成就进度成功',
        data: result
      };
    } catch (error) {
      ctx.logger.error('检查成就进度失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '检查成就进度失败',
        data: null
      };
    }
  }
}

module.exports = AchievementController; 