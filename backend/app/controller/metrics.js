const { Controller } = require('egg');

class MetricsController extends Controller {
  // 获取指标数据
  async getData() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const { metric } = ctx.params;
    const { range } = ctx.query;

    try {
      ctx.logger.info('获取指标数据, userId:', userId, 'metric:', metric, 'range:', range);
      const data = await service.metrics.getData(userId, metric, range);
      ctx.body = data;
    } catch (error) {
      ctx.logger.error('获取指标数据失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  // 获取指标统计数据
  async getStats() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const { startDate, endDate } = ctx.query;

    try {
      ctx.logger.info('获取指标统计数据, userId:', userId, 'startDate:', startDate, 'endDate:', endDate);
      const stats = await service.metrics.getStats(userId, startDate, endDate);
      ctx.body = stats;
    } catch (error) {
      ctx.logger.error('获取指标统计数据失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }

  // 获取指标趋势数据
  async getTrend() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const { metric } = ctx.params;
    const { period } = ctx.query;

    try {
      ctx.logger.info('获取指标趋势数据, userId:', userId, 'metric:', metric, 'period:', period);
      const trend = await service.metrics.getTrend(userId, metric, period);
      ctx.body = trend;
    } catch (error) {
      ctx.logger.error('获取指标趋势数据失败:', error);
      ctx.status = 500;
      ctx.body = { message: error.message };
    }
  }
}

module.exports = MetricsController; 