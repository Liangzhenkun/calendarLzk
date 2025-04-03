const Controller = require('egg').Controller;

class AchievementController extends Controller {
  // 获取所有成就列表
  async list() {
    const { ctx } = this;
    const achievements = await ctx.service.achievement.getAllAchievements();
    ctx.body = achievements;
  }

  // 获取用户成就
  async user() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const userAchievements = await ctx.service.achievement.getUserAchievements(userId);
    ctx.body = userAchievements;
  }

  // 检查成就进度
  async check() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const newAchievements = await ctx.service.achievement.checkProgress(userId);
    ctx.body = { newAchievements };
  }

  // 获取当前连续签到天数
  async streak() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const currentStreak = await ctx.service.achievement.getCurrentStreak(userId);
    ctx.body = { currentStreak };
  }
  
  // 手动重新计算连续天数
  async recalculateStreak() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    
    try {
      // 重新计算连续天数
      const streak = await ctx.service.achievement.recalculateStreak(userId);
      
      // 检查相关的连续打卡成就
      const updatedAchievements = await ctx.service.achievement._checkStreakAchievements(userId);
      
      ctx.body = { 
        success: true, 
        streak,
        updatedAchievements: updatedAchievements.length > 0 ? updatedAchievements : undefined
      };
    } catch (error) {
      ctx.logger.error('重新计算连续天数失败:', error);
      ctx.body = { 
        success: false, 
        error: error.message 
      };
      ctx.status = 500;
    }
  }
}

module.exports = AchievementController; 