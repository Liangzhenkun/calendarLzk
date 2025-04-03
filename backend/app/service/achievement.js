const Service = require('egg').Service;

class AchievementService extends Service {
  // 获取所有成就
  async getAllAchievements() {
    const achievements = await this.app.mysql.select('achievements');
    return achievements;
  }

  // 获取用户已解锁的成就
  async getUserAchievements(userId) {
    const userAchievements = await this.app.mysql.select('user_achievements', {
      where: { user_id: userId },
      columns: ['achievement_id', 'current_value', 'completed', 'completed_at']
    });

    // 获取成就详细信息
    const achievementIds = userAchievements.map(ua => ua.achievement_id);
    const achievements = await this.app.mysql.select('achievements', {
      where: { id: achievementIds }
    });

    // 合并用户成就进度和成就详情
    return achievements.map(achievement => {
      const userProgress = userAchievements.find(ua => ua.achievement_id === achievement.id);
      return {
        ...achievement,
        progress: userProgress.current_value,
        completed: userProgress.completed,
        completed_at: userProgress.completed_at
      };
    });
  }

  // 检查成就进度
  async checkProgress(userId) {
    const newAchievements = [];
    
    // 检查首篇日记成就（启程之日）
    const firstDiaryAchievement = await this._checkFirstDiaryAchievement(userId);
    if (firstDiaryAchievement) {
      newAchievements.push(firstDiaryAchievement);
    }
    
    // 检查连续打卡类成就
    const streakAchievements = await this._checkStreakAchievements(userId);
    if (streakAchievements && streakAchievements.length > 0) {
      newAchievements.push(...streakAchievements);
    }
    
    // 检查内容类成就
    const contentAchievements = await this._checkContentAchievements(userId);
    if (contentAchievements && contentAchievements.length > 0) {
      newAchievements.push(...contentAchievements);
    }
    
    // 检查特殊活动类成就
    const specialAchievements = await this._checkSpecialAchievements(userId);
    if (specialAchievements && specialAchievements.length > 0) {
      newAchievements.push(...specialAchievements);
    }
    
    return newAchievements;
  }

  // 检查首篇日记成就
  async _checkFirstDiaryAchievement(userId) {
    // 查找"启程之日"成就（现在在streak类型中）
    const achievement = await this.app.mysql.get('achievements', { name: '启程之日' });
    if (!achievement) {
      this.ctx.logger.error('找不到"启程之日"成就');
      return null;
    }

    // 检查用户是否已获得该成就
    const userAchievement = await this.app.mysql.get('user_achievements', {
      user_id: userId,
      achievement_id: achievement.id
    });
    
    if (userAchievement && userAchievement.completed) {
      return null; // 已经完成了，不需要再次解锁
    }

    // 检查用户是否有日记
    const diaryCount = await this.app.mysql.count('diary', { user_id: userId });
    
    if (diaryCount > 0) {
      // 如果已经有用户成就记录，但未完成，则更新
      if (userAchievement) {
        await this.app.mysql.update('user_achievements', {
          id: userAchievement.id,
          current_value: 1,
          completed: true,
          completed_at: new Date()
        });
      } else {
        // 否则创建新记录
        await this.app.mysql.insert('user_achievements', {
          user_id: userId,
          achievement_id: achievement.id,
          current_value: 1,
          completed: true,
          completed_at: new Date()
        });
      }

      // 发放奖励
      await this._grantReward(userId, achievement);
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon_url: achievement.icon_url
      };
    }
    
    return null;
  }

  // 获取用户当前连续签到天数
  async getCurrentStreak(userId) {
    try {
      // 使用优化后的连续天数计算方法
      const consecutiveDays = await this._calculateConsecutiveDiaryDays(userId);
      this.ctx.logger.info(`获取用户${userId}的当前连续打卡天数: ${consecutiveDays}天`);
      return consecutiveDays;
    } catch (error) {
      this.ctx.logger.error('获取连续打卡天数时出错:', error);
      return 0;
    }
  }

  // 手动重新计算用户的连续签到天数
  async recalculateStreak(userId) {
    try {
      // 使用优化后的连续天数计算方法
      const consecutiveDays = await this._calculateConsecutiveDiaryDays(userId);
      this.ctx.logger.info(`重新计算用户${userId}的连续打卡天数: ${consecutiveDays}天`);
      
      // 更新所有streak类型成就的进度
      const streakAchievements = await this.app.mysql.select('achievements', { 
        where: { type: 'streak' },
        orders: [['required_value', 'asc']]
      });
      
      // 获取用户现有的成就记录
      const userAchievements = await this.app.mysql.select('user_achievements', {
        where: { user_id: userId }
      });
      
      // 为每个streak成就更新进度
      for (const achievement of streakAchievements) {
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        
        if (userAchievement) {
          // 更新现有记录
          await this.app.mysql.update('user_achievements', {
            id: userAchievement.id,
            current_value: consecutiveDays,
            // 如果达到要求，标记为已完成
            completed: consecutiveDays >= achievement.required_value ? true : userAchievement.completed,
            // 如果新完成，更新完成时间
            completed_at: (consecutiveDays >= achievement.required_value && !userAchievement.completed) 
                          ? new Date() 
                          : userAchievement.completed_at
          });
        } else {
          // 创建新记录
          await this.app.mysql.insert('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id,
            current_value: consecutiveDays,
            completed: consecutiveDays >= achievement.required_value,
            completed_at: consecutiveDays >= achievement.required_value ? new Date() : null
          });
        }
      }
      
      return consecutiveDays;
    } catch (error) {
      this.ctx.logger.error('重新计算连续打卡天数失败:', error);
      throw error;
    }
  }

  // 计算成就进度
  async _calculateProgress(userId, achievement) {
    try {
      switch (achievement.type) {
        case 'streak':
          return await this._calculateConsecutiveDiaryDays(userId);
        case 'special':
          return await this._calculateSpecialAchievement(userId, achievement);
        case 'interaction':
          return await this._calculateInteractionAchievement(userId, achievement);
        case 'content':
          return await this._calculateContentAchievement(userId);
        default:
          return 0;
      }
    } catch (error) {
      // 记录错误但返回默认值
      this.ctx.logger.error('计算成就进度时出错:', error);
      return 0;
    }
  }

  // 计算连续写日记天数
  async _calculateConsecutiveDiaryDays(userId) {
    try {
      // 获取用户所有日记按日期分组，确保每天只计算一次
      const diaries = await this.app.mysql.query(
        'SELECT DATE(date) as diary_date FROM diary WHERE user_id = ? GROUP BY DATE(date) ORDER BY diary_date DESC',
        [userId]
      );

      this.ctx.logger.info(`用户${userId}的日记总数: ${diaries.length}, 日期列表: ${diaries.map(d => d.diary_date).join(', ')}`);

      if (diaries.length === 0) {
        return 0;
      }

      let consecutiveDays = 1; // 至少有一天
      let lastDate = new Date(diaries[0].diary_date);
      
      // 从第二条记录开始检查连续性
      for (let i = 1; i < diaries.length; i++) {
        const currentDate = new Date(diaries[i].diary_date);
        
        // 计算日期差异（天数）
        const dayDiff = Math.round((lastDate - currentDate) / (1000 * 60 * 60 * 24));
        
        this.ctx.logger.info(`检查连续性: 当前日期 ${currentDate.toISOString().split('T')[0]}, 上一日期 ${lastDate.toISOString().split('T')[0]}, 差距天数: ${dayDiff}`);
        
        if (dayDiff === 1) {
          // 连续的一天
          consecutiveDays++;
          lastDate = currentDate;
        } else if (dayDiff === 0) {
          // 同一天多条日记，忽略
          continue;
        } else {
          // 连续中断
          break;
        }
      }

      this.ctx.logger.info(`用户${userId}的连续打卡天数计算结果: ${consecutiveDays}天`);
      return consecutiveDays;
    } catch (error) {
      this.ctx.logger.error('计算连续写日记天数时出错:', error);
      return 0;
    }
  }

  // 计算特殊成就进度
  async _calculateSpecialAchievement(userId, achievement) {
    try {
      switch (achievement.id) {
        case 17: // 春之物语
        case 18: // 夏之轻语
        case 19: // 秋之私语
        case 20: // 冬之絮语
        case 21: // 时光守护者
        case 22: // 岁月见证者
          return await this._calculateConsecutiveDiaryDays(userId);
        case 23: // 夜之诗人
          return await this._checkNightWriting(userId);
        case 24: // 晨光笔记
          return await this._checkMorningWriting(userId);
        case 25: // 节日记事官
          return await this._checkHolidayWriting(userId);
        default:
          return 0;
      }
    } catch (error) {
      this.ctx.logger.error('计算特殊成就进度时出错:', error);
      return 0;
    }
  }

  // 检查夜间写作
  async _checkNightWriting(userId) {
    try {
      const result = await this.app.mysql.query(
        'SELECT COUNT(*) as count FROM diary ' +
        'WHERE user_id = ? AND (TIME(created_at) >= "23:00:00" OR TIME(created_at) <= "05:00:00")',
        [userId]
      );
      return result[0].count > 0 ? 1 : 0;
    } catch (error) {
      this.ctx.logger.error('检查夜间写作时出错:', error);
      return 0;
    }
  }

  // 检查清晨写作
  async _checkMorningWriting(userId) {
    try {
      const result = await this.app.mysql.query(
        'SELECT COUNT(*) as count FROM diary ' +
        'WHERE user_id = ? AND TIME(created_at) BETWEEN "05:00:00" AND "07:00:00"',
        [userId]
      );
      return result[0].count > 0 ? 1 : 0;
    } catch (error) {
      this.ctx.logger.error('检查清晨写作时出错:', error);
      return 0;
    }
  }

  // 检查节日写作
  async _checkHolidayWriting(userId) {
    // TODO: 实现节日判断逻辑
    return 0;
  }

  // 计算互动成就进度
  async _calculateInteractionAchievement(userId, achievement) {
    try {
      switch (achievement.id) {
        case 26: // 破茧之笔
          return await this._checkFirstDiary(userId);
        case 27: // 初识之印
          return await this._checkProfileCompletion(userId);
        case 28: // 个性之彩
          return await this._checkThemeCustomization(userId);
        case 29: // 时间之约
          return await this._checkReminderSetting(userId);
        default:
          return 0;
      }
    } catch (error) {
      this.ctx.logger.error('计算互动成就进度时出错:', error);
      return 0;
    }
  }

  // 检查第一篇日记
  async _checkFirstDiary(userId) {
    try {
      const result = await this.app.mysql.query(
        'SELECT COUNT(*) as count FROM diary WHERE user_id = ?',
        [userId]
      );
      return result[0].count > 0 ? 1 : 0;
    } catch (error) {
      this.ctx.logger.error('检查第一篇日记时出错:', error);
      return 0;
    }
  }

  // 检查个人资料完善
  async _checkProfileCompletion(userId) {
    try {
      const user = await this.app.mysql.get('user', { id: userId });
      return user.avatar && user.nickname && user.bio ? 1 : 0;
    } catch (error) {
      this.ctx.logger.error('检查个人资料完善时出错:', error);
      return 0;
    }
  }

  // 检查主题自定义
  async _checkThemeCustomization(userId) {
    try {
      const user = await this.app.mysql.get('user', { id: userId });
      return user.theme_customized ? 1 : 0;
    } catch (error) {
      this.ctx.logger.error('检查主题自定义时出错:', error);
      return 0;
    }
  }

  // 检查提醒设置
  async _checkReminderSetting(userId) {
    try {
      const user = await this.app.mysql.get('user', { id: userId });
      return user.reminder_enabled ? 1 : 0;
    } catch (error) {
      this.ctx.logger.error('检查提醒设置时出错:', error);
      return 0;
    }
  }

  // 计算字数成就进度
  async _calculateContentAchievement(userId) {
    try {
      const result = await this.app.mysql.query(
        'SELECT SUM(CHAR_LENGTH(content)) as total_chars FROM diary WHERE user_id = ?',
        [userId]
      );
      return result[0].total_chars || 0;
    } catch (error) {
      this.ctx.logger.error('计算字数成就进度时出错:', error);
      return 0;
    }
  }

  // 发放成就奖励
  async _grantReward(userId, achievement) {
    try {
      // 增加积分
      if (achievement.points_reward > 0) {
        await this.service.user.addPoints(userId, achievement.points_reward);
      }
      // 增加经验值
      if (achievement.experience_reward > 0) {
        await this.service.user.addExperience(userId, achievement.experience_reward);
      }
    } catch (error) {
      this.ctx.logger.error('发放成就奖励时出错:', error);
    }
  }

  // 检查连续打卡成就
  async _checkStreakAchievements(userId) {
    try {
      // 获取当前连续打卡天数
      const consecutiveDays = await this._calculateConsecutiveDiaryDays(userId);
      this.ctx.logger.info(`用户${userId}当前连续打卡天数: ${consecutiveDays}`);
      
      if (consecutiveDays <= 0) {
        return [];
      }
      
      // 获取所有连续打卡类成就
      const streakAchievements = await this.app.mysql.select('achievements', { 
        where: { type: 'streak' },
        orders: [['required_value', 'asc']]
      });
      
      const newAchievements = [];
      
      // 检查每个连续打卡成就
      for (const achievement of streakAchievements) {
        // 跳过"启程之日"成就，因为它已经在_checkFirstDiaryAchievement中处理
        if (achievement.name === '启程之日') {
          continue;
        }
        
        // 如果连续天数达到或超过要求值
        if (consecutiveDays >= achievement.required_value) {
          // 检查用户是否已经获得该成就
          const userAchievement = await this.app.mysql.get('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id
          });
          
          // 如果已完成则跳过
          if (userAchievement && userAchievement.completed) {
            continue;
          }
          
          // 如果有记录但未完成，则更新
          if (userAchievement) {
            await this.app.mysql.update('user_achievements', {
              id: userAchievement.id,
              current_value: consecutiveDays,
              completed: true,
              completed_at: new Date()
            });
          } else {
            // 否则创建新记录
            await this.app.mysql.insert('user_achievements', {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: consecutiveDays,
              completed: true,
              completed_at: new Date()
            });
          }
          
          // 发放奖励
          await this._grantReward(userId, achievement);
          
          // 添加到新解锁成就列表
          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon_url: achievement.icon_url
          });
          
          this.ctx.logger.info(`用户${userId}解锁成就: ${achievement.name}`);
        } else {
          // 如果尚未达到完成条件，但需要更新进度
          const userAchievement = await this.app.mysql.get('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id
          });
          
          if (!userAchievement) {
            // 创建进度记录
            await this.app.mysql.insert('user_achievements', {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: consecutiveDays,
              completed: false,
              completed_at: null
            });
          } else if (userAchievement.current_value < consecutiveDays) {
            // 更新进度
            await this.app.mysql.update('user_achievements', {
              id: userAchievement.id,
              current_value: consecutiveDays
            });
          }
        }
      }
      
      return newAchievements;
    } catch (error) {
      this.ctx.logger.error('检查连续打卡成就时出错:', error);
      return [];
    }
  }
  
  // 检查内容类成就（累计字数等）
  async _checkContentAchievements(userId) {
    try {
      // 获取当前累计字数
      const totalChars = await this._calculateContentAchievement(userId);
      this.ctx.logger.info(`用户${userId}当前累计字数: ${totalChars}`);
      
      if (totalChars <= 0) {
        return [];
      }
      
      // 获取所有内容类成就
      const contentAchievements = await this.app.mysql.select('achievements', { 
        where: { type: 'content' },
        orders: [['required_value', 'asc']]
      });
      
      const newAchievements = [];
      
      // 检查每个内容类成就
      for (const achievement of contentAchievements) {
        // 如果累计字数达到或超过要求值
        if (totalChars >= achievement.required_value) {
          // 检查用户是否已经获得该成就
          const userAchievement = await this.app.mysql.get('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id
          });
          
          // 如果已完成则跳过
          if (userAchievement && userAchievement.completed) {
            continue;
          }
          
          // 如果有记录但未完成，则更新
          if (userAchievement) {
            await this.app.mysql.update('user_achievements', {
              id: userAchievement.id,
              current_value: totalChars,
              completed: true,
              completed_at: new Date()
            });
          } else {
            // 否则创建新记录
            await this.app.mysql.insert('user_achievements', {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: totalChars,
              completed: true,
              completed_at: new Date()
            });
          }
          
          // 发放奖励
          await this._grantReward(userId, achievement);
          
          // 添加到新解锁成就列表
          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon_url: achievement.icon_url
          });
          
          this.ctx.logger.info(`用户${userId}解锁成就: ${achievement.name}`);
        } else {
          // 如果尚未达到完成条件，但需要更新进度
          const userAchievement = await this.app.mysql.get('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id
          });
          
          if (!userAchievement) {
            // 创建进度记录
            await this.app.mysql.insert('user_achievements', {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: totalChars,
              completed: false,
              completed_at: null
            });
          } else if (userAchievement.current_value < totalChars) {
            // 更新进度
            await this.app.mysql.update('user_achievements', {
              id: userAchievement.id,
              current_value: totalChars
            });
          }
        }
      }
      
      return newAchievements;
    } catch (error) {
      this.ctx.logger.error('检查内容类成就时出错:', error);
      return [];
    }
  }
  
  // 检查特殊活动类成就
  async _checkSpecialAchievements(userId) {
    try {
      // 获取所有特殊活动类成就
      const specialAchievements = await this.app.mysql.select('achievements', { 
        where: { type: 'special' }
      });
      
      const newAchievements = [];
      
      // 检查每个特殊活动类成就
      for (const achievement of specialAchievements) {
        // 根据不同成就ID调用相应的检查方法
        let currentValue = 0;
        
        switch (achievement.id) {
          case 23: // 夜之诗人
            currentValue = await this._checkNightWriting(userId);
            break;
          case 24: // 晨光笔记
            currentValue = await this._checkMorningWriting(userId);
            break;
          case 25: // 节日记事官
            currentValue = await this._checkHolidayWriting(userId);
            break;
          // 可以添加更多特殊成就的检查
          default:
            continue;
        }
        
        // 如果满足成就条件
        if (currentValue >= achievement.required_value) {
          // 检查用户是否已经获得该成就
          const userAchievement = await this.app.mysql.get('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id
          });
          
          // 如果已完成则跳过
          if (userAchievement && userAchievement.completed) {
            continue;
          }
          
          // 如果有记录但未完成，则更新
          if (userAchievement) {
            await this.app.mysql.update('user_achievements', {
              id: userAchievement.id,
              current_value: currentValue,
              completed: true,
              completed_at: new Date()
            });
          } else {
            // 否则创建新记录
            await this.app.mysql.insert('user_achievements', {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: currentValue,
              completed: true,
              completed_at: new Date()
            });
          }
          
          // 发放奖励
          await this._grantReward(userId, achievement);
          
          // 添加到新解锁成就列表
          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon_url: achievement.icon_url
          });
          
          this.ctx.logger.info(`用户${userId}解锁成就: ${achievement.name}`);
        } else {
          // 如果尚未达到完成条件，但需要更新进度
          const userAchievement = await this.app.mysql.get('user_achievements', {
            user_id: userId,
            achievement_id: achievement.id
          });
          
          if (!userAchievement) {
            // 创建进度记录
            await this.app.mysql.insert('user_achievements', {
              user_id: userId,
              achievement_id: achievement.id,
              current_value: currentValue,
              completed: false,
              completed_at: null
            });
          } else if (userAchievement.current_value < currentValue) {
            // 更新进度
            await this.app.mysql.update('user_achievements', {
              id: userAchievement.id,
              current_value: currentValue
            });
          }
        }
      }
      
      return newAchievements;
    } catch (error) {
      this.ctx.logger.error('检查特殊活动类成就时出错:', error);
      return [];
    }
  }
}

module.exports = AchievementService; 