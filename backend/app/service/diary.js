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
      
      const formattedDate = this.formatDate(diary.date);

      // 检查是否存在同一天的日记
      const existingDiary = await app.mysql.get(TABLE_NAME, {
        user_id: diary.userId,
        date: formattedDate
      });
      
      const data = {
        user_id: diary.userId,
        title: diary.title,
        date: formattedDate,
        content: diary.content,
        mood: diary.mood || 3,
        weather: diary.weather,
        type: diary.type || 'normal'
      };
      
      this.ctx.logger.info('准备处理数据:', {
        isUpdate: !!existingDiary,
        data
      });
      
      let result;
      if (existingDiary) {
        // 更新已存在的日记
        result = await app.mysql.update(TABLE_NAME, {
          ...data,
          updated_at: app.mysql.literals.now
        }, {
          where: { id: existingDiary.id }
        });

        // 更新或创建个性化指标
        if (diary.metrics) {
          await this.updateMetrics(diary.userId, existingDiary.id, formattedDate, diary.metrics);
        }

        return { ...diary, id: existingDiary.id };
      } else {
        // 创建新日记
        result = await app.mysql.insert(TABLE_NAME, data);
        
        // 创建个性化指标
        if (diary.metrics) {
          await this.updateMetrics(diary.userId, result.insertId, formattedDate, diary.metrics);
        }

        return { ...diary, id: result.insertId };
      }
    } catch (error) {
      this.ctx.logger.error('创建/更新日记失败:', error);
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
      const formattedDate = this.formatDate(date);

      // 获取日记
      const diary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });

      if (!diary) {
        return null;
      }

      // 获取个性化指标
      const metrics = await app.mysql.get('personal_metrics', {
        diary_id: diary.id
      });

      return {
        ...diary,
        metrics: metrics ? {
          sleepQuality: metrics.sleep_quality,
          stressLevel: metrics.stress_level,
          productivity: metrics.productivity
        } : null
      };
    } catch (error) {
      this.ctx.logger.error('按日期获取日记失败:', error);
      throw error;
    }
  }

  async updateByDate(userId, date, data) {
    const { app } = this;
    try {
      const formattedDate = this.formatDate(date);

      // 获取现有日记
      const existingDiary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });

      if (!existingDiary) {
        return null;
      }

      // 更新日记
      const updateData = {
        title: data.title,
        content: data.content,
        mood: data.mood || existingDiary.mood,
        weather: data.weather || existingDiary.weather,
        type: data.type || existingDiary.type,
        updated_at: app.mysql.literals.now
      };

      const result = await app.mysql.update(TABLE_NAME, updateData, {
        where: { id: existingDiary.id }
      });

      // 更新个性化指标
      if (data.metrics) {
        await this.updateMetrics(userId, existingDiary.id, formattedDate, data.metrics);
      }

      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('更新日记失败:', error);
      throw error;
    }
  }

  async deleteByDate(userId, date) {
    const { app } = this;
    try {
      const formattedDate = this.formatDate(date);

      // 获取日记
      const diary = await app.mysql.get(TABLE_NAME, {
        user_id: userId,
        date: formattedDate
      });

      if (!diary) {
        return false;
      }

      // 删除相关的个性化指标
      await app.mysql.delete('personal_metrics', {
        diary_id: diary.id
      });

      // 删除日记
      const result = await app.mysql.delete(TABLE_NAME, {
        id: diary.id
      });

      return result.affectedRows > 0;
    } catch (error) {
      this.ctx.logger.error('删除日记失败:', error);
      throw error;
    }
  }

  // 抽取指标更新方法
  async updateMetrics(userId, diaryId, date, metrics) {
    const { app } = this;
    const metricsData = {
      user_id: userId,
      diary_id: diaryId,
      date: date,
      sleep_quality: metrics.sleepQuality || 5,
      energy_level: metrics.energyLevel || 5,
      stress_level: metrics.stressLevel || 5,
      productivity: metrics.productivity || 5,
      mood_score: metrics.moodScore || 5,
      social_satisfaction: metrics.socialSatisfaction || 5,
      family_index: metrics.familyIndex || 5,
      health_score: metrics.healthScore || 5
    };

    const existingMetrics = await app.mysql.get('personal_metrics', {
      diary_id: diaryId
    });

    if (existingMetrics) {
      // 更新所有指标值和更新时间
      await app.mysql.update('personal_metrics', {
        sleep_quality: metricsData.sleep_quality,
        energy_level: metricsData.energy_level,
        stress_level: metricsData.stress_level,
        productivity: metricsData.productivity,
        mood_score: metricsData.mood_score,
        social_satisfaction: metricsData.social_satisfaction,
        family_index: metricsData.family_index,
        health_score: metricsData.health_score,
        updated_at: app.mysql.literals.now
      }, {
        where: { id: existingMetrics.id }
      });
    } else {
      await app.mysql.insert('personal_metrics', metricsData);
    }
  }

  /**
   * 获取用户的所有日记
   * @param {string} userId - 用户ID
   * @return {Promise<Array>} - 日记列表
   */
  async getDiaries(userId) {
    const { ctx } = this;
    return ctx.model.Diary.find({ userId }).sort({ date: -1 });
  }

  /**
   * 创建新日记
   * @param {string} userId - 用户ID
   * @param {Object} diaryData - 日记数据
   * @return {Promise<Object>} - 创建的日记
   */
  async createDiary(userId, diaryData) {
    const { ctx } = this;
    const { title, content, mood } = diaryData;
    
    const diary = new ctx.model.Diary({
      userId,
      title,
      content,
      mood,
      date: new Date(),
      exp: 10
    });
    
    await diary.save();

    // 更新用户经验值
    await ctx.model.User.findByIdAndUpdate(
      userId,
      { $inc: { exp: diary.exp } }
    );

    return diary;
  }

  /**
   * 获取特定日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @return {Promise<Object>} - 日记数据
   */
  async getDiary(diaryId, userId) {
    const { ctx } = this;
    return ctx.model.Diary.findOne({
      _id: diaryId,
      userId
    });
  }

  /**
   * 更新日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @return {Promise<Object>} - 更新后的日记
   */
  async updateDiary(diaryId, userId, updateData) {
    const { ctx } = this;
    const { title, content, mood } = updateData;
    
    return ctx.model.Diary.findOneAndUpdate(
      { _id: diaryId, userId },
      { title, content, mood },
      { new: true }
    );
  }

  /**
   * 删除日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @return {Promise<boolean>} - 删除结果
   */
  async deleteDiary(diaryId, userId) {
    const { ctx } = this;
    const result = await ctx.model.Diary.findOneAndDelete({
      _id: diaryId,
      userId
    });
    
    return !!result;
  }
}

module.exports = DiaryService; 