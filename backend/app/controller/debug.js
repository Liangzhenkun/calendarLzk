'use strict';

const Controller = require('egg').Controller;

class DebugController extends Controller {
  async testDeleteDiary() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;
    
    ctx.logger.info('======= 测试删除日记 ========');
    ctx.logger.info('请求参数:', { userId, date });
    
    try {
      // 格式化日期
      const formattedDate = ctx.service.diary.formatDate(date);
      ctx.logger.info('格式化日期结果:', formattedDate);
      
      // 查询日记
      const diary = await ctx.app.mysql.get('diary', {
        user_id: userId,
        date: formattedDate
      });
      ctx.logger.info('查询日记结果:', diary);
      
      if (!diary) {
        ctx.status = 404;
        ctx.body = { success: false, message: '日记不存在' };
        return;
      }
      
      // 查询个性化指标
      try {
        const metrics = await ctx.app.mysql.get('personal_metrics', {
          diary_id: diary.id
        });
        ctx.logger.info('查询个性化指标结果:', metrics);
        
        // 尝试删除个性化指标
        if (metrics) {
          const metricsResult = await ctx.app.mysql.delete('personal_metrics', {
            diary_id: diary.id
          });
          ctx.logger.info('删除个性化指标结果:', metricsResult);
        }
      } catch (metricsError) {
        ctx.logger.error('处理个性化指标时出错:', metricsError);
        // 继续执行，不中断流程
      }
      
      // 尝试删除日记
      try {
        const result = await ctx.app.mysql.delete('diary', {
          id: diary.id
        });
        ctx.logger.info('删除日记结果:', result);
        
        ctx.body = {
          success: true,
          message: '测试删除日记成功',
          deletedId: diary.id,
          affectedRows: result.affectedRows
        };
      } catch (deleteError) {
        ctx.logger.error('删除日记时出错:', deleteError);
        throw deleteError;
      }
    } catch (error) {
      ctx.logger.error('测试删除日记失败:', error);
      ctx.logger.error('错误堆栈:', error.stack);
      ctx.status = 500;
      ctx.body = { 
        success: false,
        message: '测试失败',
        error: error.message,
        stack: error.stack
      };
    }
  }
}

module.exports = DebugController;
