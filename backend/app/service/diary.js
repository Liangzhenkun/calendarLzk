'use strict';

const Service = require('egg').Service;

const TABLE_NAME = 'diary';

class DiaryService extends Service {
  // 抽取日期格式化方法
  formatDate(date) {
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      throw new Error('无效的日期格式');
    } catch (e) {
      this.ctx.logger.error('日期格式化失败:', e);
      throw new Error('日期格式化失败');
    }
  }

  async create(diary) {
    const { app } = this;
    try {
      this.ctx.logger.info('创建日记，接收到的数据:', diary);
      
      // 验证必要字段
      const requiredFields = ['date', 'title', 'content'];
      const missingFields = requiredFields.filter(field => !diary[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`缺少必要字段: ${missingFields.join(', ')}`);
      }
      
      // 如果使用的是state.user.id，需要确保设置了userId
      const userId = diary.userId || this.ctx.state.user.id;
      if (!userId) {
        throw new Error('用户ID不能为空');
      }

      const formattedDate = this.formatDate(diary.date);

      // 检查是否存在同一天的日记
      const existingDiary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });
      
      const data = {
        user_id: userId,
        title: diary.title,
        date: formattedDate,
        content: diary.content,
        mood: diary.mood || 3,
        weather: diary.weather || 'sunny',
        created_at: app.mysql.literals.now,
        updated_at: app.mysql.literals.now
      };
      
      this.ctx.logger.info('准备处理数据:', {
        isUpdate: !!existingDiary,
        data
      });
      
      let result;
      let savedDiary;
      
      if (existingDiary) {
        // 更新现有日记
        result = await app.mysql.update(TABLE_NAME, data, {
          where: { id: existingDiary.id }
        });
        savedDiary = { ...existingDiary, ...data };
      } else {
        // 创建新日记
        result = await app.mysql.insert(TABLE_NAME, data);
        savedDiary = { id: result.insertId, ...data };
      }

      // 处理个性化指标
      if (diary.metrics) {
        try {
          const metricsData = {
            diary_id: savedDiary.id,
            sleep_quality: diary.metrics.sleepQuality || 5,
            stress_level: diary.metrics.stressLevel || 5,
            productivity: diary.metrics.productivity || 5,
            created_at: app.mysql.literals.now,
            updated_at: app.mysql.literals.now
          };

          // 检查是否存在现有指标
          const existingMetrics = await app.mysql.get('personal_metrics', {
            diary_id: savedDiary.id
          });

          if (existingMetrics) {
            await app.mysql.update('personal_metrics', metricsData, {
              where: { diary_id: savedDiary.id }
            });
          } else {
            await app.mysql.insert('personal_metrics', metricsData);
          }

          savedDiary.metrics = {
            sleepQuality: metricsData.sleep_quality,
            stressLevel: metricsData.stress_level,
            productivity: metricsData.productivity
          };
        } catch (error) {
          this.ctx.logger.error('保存个性化指标失败:', error);
          // 不抛出异常，避免影响主流程
        }
      }

      return savedDiary;
    } catch (error) {
      this.ctx.logger.error('创建日记失败:', {
        error: error.message,
        stack: error.stack,
        data: diary
      });
      throw error;
    }
  }

  async list(userId) {
    const { app } = this;
    try {
      return await app.mysql.select(TABLE_NAME, {
        where: { user_id: userId },
        orders: [['date', 'desc']],
      });
    } catch (error) {
      this.ctx.logger.error('获取日记列表失败:', error);
      throw error;
    }
  }

  async detail(userId, id) {
    const { app } = this;
    try {
      return await app.mysql.get(TABLE_NAME, { id, user_id: userId });
    } catch (error) {
      this.ctx.logger.error('获取日记详情失败:', error);
      throw error;
    }
  }

  async update(userId, id, data) {
    const { app } = this;
    try {
      this.ctx.logger.info('更新日记，接收到的数据:', { userId, id, data });
      
      // 首先检查日记是否存在
      const existingDiary = await app.mysql.get(TABLE_NAME, { id, user_id: userId });
      if (!existingDiary) {
        throw new Error('日记不存在');
      }
      
      // 转换字段名和格式化日期
      const updateData = {
        title: data.title,
        content: data.content,
        mood: data.mood || existingDiary.mood,
        weather: data.weather || existingDiary.weather,
        type: data.type || existingDiary.type,
        updated_at: app.mysql.literals.now
      };

      // 如果有日期字段，确保正确格式化
      if (data.date) {
        try {
          const dateObj = new Date(data.date);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const newDate = `${year}-${month}-${day}`;
            
            // 检查新日期是否与其他日记冲突
            if (newDate !== existingDiary.date) {
              const conflictDiary = await app.mysql.get(TABLE_NAME, {
                user_id: userId,
                date: newDate
              });
              
              if (conflictDiary && conflictDiary.id !== id) {
                throw new Error('该日期已存在日记');
              }
              
              updateData.date = newDate;
            }
          } else {
            throw new Error('无效的日期格式');
          }
        } catch (e) {
          this.ctx.logger.error('日期格式化失败:', e);
          throw new Error('日期格式化失败');
        }
      }
      
      // 移除未定义的字段
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      this.ctx.logger.info('准备更新数据:', updateData);
      
      const result = await app.mysql.update(TABLE_NAME, updateData, {
        where: { id, user_id: userId }
      });
      
      // 更新个性化指标
      if (data.metrics) {
        try {
          // 格式化日期
          let formattedDate = existingDiary.date;
          if (updateData.date) {
            formattedDate = updateData.date;
          }
          
          await this.updateMetrics(userId, id, formattedDate, data.metrics);
        } catch (e) {
          this.ctx.logger.error('更新个性化指标失败:', e);
          // 不抛出异常，避免影响主流程
        }
      }

      // 检查成就进度
      await this.service.achievement.checkAchievements(userId);
      
      this.ctx.logger.info('日记更新结果:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
      
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('更新日记失败:', error);
      throw error;
    }
  }

  async delete(userId, id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete(TABLE_NAME, {
        id,
        user_id: userId
      });
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('删除日记失败:', error);
      throw error;
    }
  }

  async getByDate(userId, date) {
    const { app } = this;
    try {
      this.ctx.logger.info('按日期获取日记，传入参数:', { userId, date });
      
      const formattedDate = this.formatDate(date);
      this.ctx.logger.info('格式化后的日期:', formattedDate);

      // 获取日记
      const diary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });

      this.ctx.logger.info('查询结果:', diary);

      if (!diary) {
        return null;
      }

      // 获取个性化指标
      let metrics = null;
      try {
        metrics = await app.mysql.get('personal_metrics', {
          diary_id: diary.id
        });
      } catch (e) {
        this.ctx.logger.error('获取个性化指标失败:', e);
        // 忽略错误，继续返回日记
      }

      const result = {
        ...diary,
        metrics: metrics ? {
          sleepQuality: metrics.sleep_quality,
          stressLevel: metrics.stress_level,
          productivity: metrics.productivity
        } : null
      };
      
      this.ctx.logger.info('返回的日记数据:', result);
      return result;
    } catch (error) {
      this.ctx.logger.error('按日期获取日记失败:', error);
      this.ctx.logger.error('错误详情:', error.stack);
      throw error;
    }
  }

  async updateByDate(userId, date, data) {
    const { app } = this;
    try {
      this.ctx.logger.info('按日期更新日记，传入参数:', { userId, date, data });
      
      const formattedDate = this.formatDate(date);
      this.ctx.logger.info('格式化后的日期:', formattedDate);

      // 获取现有日记
      const existingDiary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });

      this.ctx.logger.info('查询到的现有日记:', existingDiary);

      if (!existingDiary) {
        this.ctx.logger.info('日记不存在，无法更新');
        return null;
      }

      // 构建更新数据
      const updateData = {
        title: data.title || existingDiary.title,
        content: data.content || existingDiary.content,
        mood: data.mood !== undefined ? data.mood : existingDiary.mood,
        weather: data.weather || existingDiary.weather,
        updated_at: app.mysql.literals.now
      };

      this.ctx.logger.info('准备更新数据:', updateData);

      // 更新日记
      const result = await app.mysql.update(TABLE_NAME, updateData, {
        where: { id: existingDiary.id }
      });

      this.ctx.logger.info('更新结果:', result);

      // 更新个性化指标
      try {
        if (data.metrics) {
          await this.updateMetrics(userId, existingDiary.id, formattedDate, data.metrics);
        }
      } catch (e) {
        this.ctx.logger.error('更新个性化指标失败:', e);
        // 忽略错误，不影响主流程
      }

      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('更新日记失败:', error);
      this.ctx.logger.error('错误详情:', error.stack);
      throw error;
    }
  }

  async deleteByDate(userId, date) {
    const { app } = this;
    try {
      this.ctx.logger.info('按日期删除日记，传入参数:', { userId, date });
      
      const formattedDate = this.formatDate(date);
      this.ctx.logger.info('格式化后的日期:', formattedDate);

      // 获取日记
      const diary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });

      this.ctx.logger.info('查询到的日记:', diary);

      if (!diary) {
        this.ctx.logger.info('日记不存在，无法删除');
        return false;
      }

      // 尝试删除相关的个性化指标
      try {
        await app.mysql.delete('personal_metrics', {
          diary_id: diary.id
        });
      } catch (e) {
        this.ctx.logger.error('删除个性化指标失败:', e);
        // 忽略错误，继续删除日记
      }

      // 删除日记
      const result = await app.mysql.delete(TABLE_NAME, {
        id: diary.id
      });

      this.ctx.logger.info('删除结果:', result);
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('删除日记失败:', error);
      this.ctx.logger.error('错误详情:', error.stack);
      throw error;
    }
  }

  // 抽取指标更新方法
  async updateMetrics(userId, diaryId, date, metrics) {
    const { app } = this;
    try {
      this.ctx.logger.info('更新指标，接收到的数据:', metrics);

      const metricsData = {
        diary_id: diaryId,
        user_id: userId,
        date: date,
        sleep_quality: metrics.sleepQuality || 0,
        stress_level: metrics.stressLevel || 0,
        productivity: metrics.productivity || 0,
        created_at: app.mysql.literals.now,
        updated_at: app.mysql.literals.now
      };

      this.ctx.logger.info('处理后的指标数据:', metricsData);

      // 检查是否已存在指标记录
      const existingMetrics = await app.mysql.get('personal_metrics', {
        diary_id: diaryId
      });

      if (existingMetrics) {
        // 更新现有记录
        await app.mysql.update('personal_metrics', {
          ...metricsData,
          updated_at: app.mysql.literals.now
        }, {
          where: { diary_id: diaryId }
        });
      } else {
        // 创建新记录
        await app.mysql.insert('personal_metrics', metricsData);
      }
    } catch (error) {
      this.ctx.logger.error('更新个性化指标失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的所有日记
   * @param {string} userId - 用户ID
   * @return {Promise<Array>} - 日记列表
   */
  async getDiaries(userId) {
    const { app } = this;
    try {
      return await app.mysql.select(TABLE_NAME, {
        where: { user_id: userId },
        orders: [['date', 'desc']]
      });
    } catch (error) {
      this.ctx.logger.error('获取日记列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取特定日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @return {Promise<Object>} - 日记数据
   */
  async getDiary(diaryId, userId) {
    const { app } = this;
    try {
      return await app.mysql.get(TABLE_NAME, {
        id: diaryId,
        user_id: userId
      });
    } catch (error) {
      this.ctx.logger.error('获取日记详情失败:', error);
      throw error;
    }
  }

  /**
   * 更新日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @return {Promise<Object>} - 更新后的日记
   */
  async updateDiary(diaryId, userId, updateData) {
    const { app } = this;
    try {
      const { title, content, mood } = updateData;
      
      const result = await app.mysql.update(TABLE_NAME, {
        title,
        content,
        mood,
        updated_at: app.mysql.literals.now
      }, {
        where: {
          id: diaryId,
          user_id: userId
        }
      });
      
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('更新日记失败:', error);
      throw error;
    }
  }

  /**
   * 删除日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @return {Promise<boolean>} - 删除结果
   */
  async deleteDiary(diaryId, userId) {
    const { app } = this;
    try {
      const result = await app.mysql.delete(TABLE_NAME, {
        id: diaryId,
        user_id: userId
      });
      
      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('删除日记失败:', error);
      throw error;
    }
  }
}

module.exports = DiaryService; 