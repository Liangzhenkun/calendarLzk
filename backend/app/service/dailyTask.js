const Service = require('egg').Service;

class DailyTaskService extends Service {
  // 获取用户的每日任务
  async getUserDailyTasks(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取所有任务类型
    const taskTypes = await this.app.mysql.select('task_types');
    
    // 获取用户今天的任务
    const userTasks = await this.app.mysql.select('daily_tasks', {
      where: {
        user_id: userId,
        date: today
      }
    });

    // 如果用户今天没有任务，为每个任务类型创建新任务
    if (userTasks.length === 0) {
      const newTasks = [];
      for (const taskType of taskTypes) {
        const task = {
          user_id: userId,
          task_type_id: taskType.id,
          date: today,
          status: 'pending'
        };
        const result = await this.app.mysql.insert('daily_tasks', task);
        newTasks.push({
          ...task,
          id: result.insertId,
          ...taskType
        });

        // 记录任务创建历史
        await this.app.mysql.insert('task_history', {
          user_id: userId,
          task_id: result.insertId,
          action: 'created',
          points_earned: 0,
          experience_earned: 0
        });
      }
      return newTasks;
    }

    // 合并任务信息和任务类型信息
    return userTasks.map(task => {
      const taskType = taskTypes.find(type => type.id === task.task_type_id);
      return {
        ...task,
        ...taskType
      };
    });
  }

  // 完成任务
  async completeTask(userId, taskId) {
    // 检查任务是否存在且属于该用户
    const task = await this.app.mysql.get('daily_tasks', {
      id: taskId,
      user_id: userId
    });

    if (!task) {
      throw new Error('任务不存在或不属于该用户');
    }

    if (task.status === 'completed') {
      throw new Error('任务已经完成');
    }

    // 获取任务类型信息
    const taskType = await this.app.mysql.get('task_types', {
      id: task.task_type_id
    });

    // 更新任务状态
    await this.app.mysql.update('daily_tasks', {
      status: 'completed',
      completed_at: new Date()
    }, {
      where: {
        id: taskId
      }
    });

    // 记录任务完成历史
    await this.app.mysql.insert('task_history', {
      user_id: userId,
      task_id: taskId,
      action: 'completed',
      points_earned: taskType.points_reward,
      experience_earned: taskType.experience_reward,
      item_reward_id: taskType.item_reward_id
    });

    // 添加积分和经验值奖励
    await this.service.user.addPoints(userId, taskType.points_reward);
    await this.service.user.addExperience(userId, taskType.experience_reward);

    // 如果有物品奖励，添加到用户物品栏
    if (taskType.item_reward_id) {
      await this.service.user.addItem(userId, taskType.item_reward_id);
    }

    // 检查是否触发了任何成就
    await this.service.achievement.checkAchievements(userId);

    return {
      taskId,
      points: taskType.points_reward,
      experience: taskType.experience_reward,
      item_reward: taskType.item_reward_id,
      message: `任务完成！获得 ${taskType.points_reward} 积分和 ${taskType.experience_reward} 经验值`
    };
  }

  // 获取任务历史
  async getTaskHistory(userId) {
    const history = await this.app.mysql.query(
      `SELECT 
        th.*,
        dt.date,
        dt.status,
        tt.name as task_name,
        tt.description as task_description,
        tt.icon_url
      FROM task_history th
      JOIN daily_tasks dt ON th.task_id = dt.id
      JOIN task_types tt ON dt.task_type_id = tt.id
      WHERE th.user_id = ?
      ORDER BY th.created_at DESC
      LIMIT 50`,
      [userId]
    );

    return history;
  }

  // 获取用户的任务统计信息
  async getTaskStats(userId) {
    const stats = await this.app.mysql.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        (SELECT SUM(points_earned) FROM task_history WHERE user_id = ?) as total_points,
        (SELECT SUM(experience_earned) FROM task_history WHERE user_id = ?) as total_experience
      FROM daily_tasks
      WHERE user_id = ?`,
      [userId, userId, userId]
    );

    const streakInfo = await this.app.mysql.query(
      `WITH consecutive_days AS (
        SELECT 
          date,
          @streak := IF(@prev_date = DATE_SUB(date, INTERVAL 1 DAY), @streak + 1, 1) as streak,
          @prev_date := date
        FROM (
          SELECT DISTINCT date
          FROM daily_tasks
          WHERE user_id = ? AND status = 'completed'
          ORDER BY date DESC
        ) dates
        CROSS JOIN (SELECT @streak := 0, @prev_date := NULL) vars
      )
      SELECT MAX(streak) as current_streak
      FROM consecutive_days`,
      [userId]
    );

    return {
      ...stats[0],
      current_streak: streakInfo[0].current_streak || 0
    };
  }
}

module.exports = DailyTaskService; 