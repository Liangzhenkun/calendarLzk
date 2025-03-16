const Service = require('egg').Service;

const TABLE_NAME = 'diary';

class DiaryService extends Service {
  async create(diary) {
    const { app } = this;
    try {
      this.ctx.logger.info('创建日记，接收到的数据:', diary);
      
      // 格式化日期
      let formattedDate;
      try {
        const dateObj = new Date(diary.date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else {
          throw new Error('无效的日期格式');
        }
      } catch (e) {
        this.ctx.logger.error('日期格式化失败:', e);
        throw new Error('日期格式化失败');
      }

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
          date: formattedDate,
          updated_at: app.mysql.literals.now
        }, {
          where: { id: existingDiary.id }
        });

        // 更新或创建个性化指标
        if (diary.metrics) {
          const metricsData = {
            user_id: diary.userId,
            diary_id: existingDiary.id,
            date: formattedDate,
            sleep_quality: diary.metrics.sleepQuality || 5,
            stress_level: diary.metrics.stressLevel || 5,
            productivity: diary.metrics.productivity || 5
          };

          // 检查是否存在指标记录
          const existingMetrics = await app.mysql.get('personal_metrics', {
            diary_id: existingDiary.id
          });

          if (existingMetrics) {
            await app.mysql.update('personal_metrics', {
              ...metricsData,
              updated_at: app.mysql.literals.now
            }, {
              where: { id: existingMetrics.id }
            });
          } else {
            await app.mysql.insert('personal_metrics', metricsData);
          }
        }

        return { ...diary, id: existingDiary.id };
      } else {
        // 创建新日记
        result = await app.mysql.insert(TABLE_NAME, data);
        
        // 创建个性化指标
        if (diary.metrics) {
          const metricsData = {
            user_id: diary.userId,
            diary_id: result.insertId,
            date: formattedDate,
            sleep_quality: diary.metrics.sleepQuality || 5,
            stress_level: diary.metrics.stressLevel || 5,
            productivity: diary.metrics.productivity || 5
          };
          
          await app.mysql.insert('personal_metrics', metricsData);
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
          
          const metricsData = {
            user_id: userId,
            diary_id: id,
            date: formattedDate,
            sleep_quality: data.metrics.sleepQuality || 5,
            stress_level: data.metrics.stressLevel || 5,
            productivity: data.metrics.productivity || 5
          };

          // 检查是否存在指标记录
          const existingMetrics = await app.mysql.get('personal_metrics', {
            diary_id: id
          });

          if (existingMetrics) {
            await app.mysql.update('personal_metrics', {
              ...metricsData,
              updated_at: app.mysql.literals.now
            }, {
              where: { id: existingMetrics.id }
            });
          } else {
            await app.mysql.insert('personal_metrics', metricsData);
          }
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
}

module.exports = DiaryService; 