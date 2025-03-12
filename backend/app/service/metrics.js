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

  // 获取指标统计数据
  async getStats(userId, startDate, endDate) {
    const { app } = this;
    try {
      const sql = `
        SELECT 
          AVG(sleep_quality) as avg_sleep_quality,
          AVG(energy_level) as avg_energy_level,
          AVG(stress_level) as avg_stress_level,
          AVG(productivity) as avg_productivity,
          AVG(exercise_minutes) as avg_exercise_minutes,
          AVG(water_cups) as avg_water_cups,
          AVG(mood_score) as avg_mood_score,
          AVG(social_satisfaction) as avg_social_satisfaction,
          AVG(family_index) as avg_family_index,
          AVG(health_score) as avg_health_score
        FROM personal_metrics
        WHERE user_id = ?
          AND date BETWEEN ? AND ?
      `;

      const [results] = await app.mysql.query(sql, [userId, startDate, endDate]);
      return results;
    } catch (error) {
      this.ctx.logger.error('获取指标统计数据失败:', error);
      throw error;
    }
  }

  // 获取指标趋势数据
  async getTrend(userId, metric, period = 'week') {
    const { app } = this;
    try {
      let interval;
      let startDate = new Date();

      switch (period) {
        case 'week':
          interval = 'DAY';
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          interval = 'WEEK';
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          interval = 'MONTH';
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          interval = 'DAY';
          startDate.setDate(startDate.getDate() - 7);
      }

      const metricField = this.getMetricField(metric);
      if (!metricField) {
        throw new Error('无效的指标类型');
      }

      const sql = `
        SELECT 
          DATE_FORMAT(date, 
            CASE 
              WHEN ? = 'DAY' THEN '%Y-%m-%d'
              WHEN ? = 'WEEK' THEN '%Y-%u'
              WHEN ? = 'MONTH' THEN '%Y-%m'
            END
          ) as time_period,
          AVG(${metricField}) as value
        FROM personal_metrics
        WHERE user_id = ?
          AND date >= ?
        GROUP BY time_period
        ORDER BY time_period ASC
      `;

      const results = await app.mysql.query(sql, [
        interval,
        interval,
        interval,
        userId,
        startDate.toISOString().split('T')[0]
      ]);

      return results;
    } catch (error) {
      this.ctx.logger.error('获取指标趋势数据失败:', error);
      throw error;
    }
  }

  // 获取指标字段名
  getMetricField(metric) {
    const metricMap = {
      sleep: 'sleep_quality',
      energy: 'energy_level',
      stress: 'stress_level',
      productivity: 'productivity',
      exercise: 'exercise_minutes',
      water: 'water_cups',
      mood: 'mood_score',
      social: 'social_satisfaction',
      family: 'family_index',
      health: 'health_score'
    };

    return metricMap[metric];
  }
}

module.exports = MetricsService; 