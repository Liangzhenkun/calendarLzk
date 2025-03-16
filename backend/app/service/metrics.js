const Service = require('egg').Service;

class MetricsService extends Service {
  // 获取指标数据
  async getData(userId, metric, range) {
    const { app } = this;
    try {
      let startDate, endDate;
      
      // 根据range计算日期范围
      switch (range) {
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          endDate = new Date();
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date();
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate = new Date();
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          endDate = new Date();
      }

      // 构建查询字段
      const metricField = this.getMetricField(metric);
      if (!metricField) {
        throw new Error('无效的指标类型');
      }

      const sql = `
        SELECT date, ${metricField} as value
        FROM personal_metrics
        WHERE user_id = ?
          AND date BETWEEN ? AND ?
        ORDER BY date ASC
      `;

      const results = await app.mysql.query(sql, [
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ]);

      return results;
    } catch (error) {
      this.ctx.logger.error('获取指标数据失败:', error);
      throw error;
    }
  }

  // 获取指标字段名
  getMetricField(metric) {
    const metricMap = {
      'sleep': 'sleep_quality',
      'stress': 'stress_level',
      'productivity': 'productivity'
    };
    return metricMap[metric];
  }

  // 获取指标统计数据
  async getStats(userId) {
    const { app } = this;
    try {
      const sql = `
        SELECT 
          AVG(sleep_quality) as avg_sleep,
          AVG(stress_level) as avg_stress,
          AVG(productivity) as avg_productivity
        FROM personal_metrics
        WHERE user_id = ?
        AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      `;

      const [results] = await app.mysql.query(sql, [userId]);
      return results;
    } catch (error) {
      this.ctx.logger.error('获取指标统计失败:', error);
      throw error;
    }
  }

  // 获取指标趋势
  async getTrend(userId, metric) {
    const { app } = this;
    try {
      const metricField = this.getMetricField(metric);
      if (!metricField) {
        throw new Error('无效的指标类型');
      }

      const sql = `
        SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          AVG(${metricField}) as average
        FROM personal_metrics
        WHERE user_id = ?
        AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC
      `;

      const results = await app.mysql.query(sql, [userId]);
      return results;
    } catch (error) {
      this.ctx.logger.error('获取指标趋势失败:', error);
      throw error;
    }
  }
}

module.exports = MetricsService; 