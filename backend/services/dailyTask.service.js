const db = require('../config/database');

class DailyTaskService {
    // 为用户分配每日任务
    async assignDailyTasks(userId) {
        try {
            // 清理昨天未完成的任务
            await this.cleanupOldTasks(userId);

            // 获取所有可用任务
            const [tasks] = await db.query('SELECT * FROM daily_tasks');
            
            // 随机选择3个任务
            const selectedTasks = this.getRandomTasks(tasks, 3);

            // 分配任务给用户
            for (const task of selectedTasks) {
                await db.query(
                    'INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)',
                    [userId, task.id]
                );
            }

            return selectedTasks;
        } catch (error) {
            console.error('Error assigning daily tasks:', error);
            throw error;
        }
    }

    // 清理过期任务
    async cleanupOldTasks(userId) {
        try {
            await db.query(
                `DELETE FROM user_tasks 
                WHERE user_id = ? 
                AND DATE(assigned_at) < CURDATE()
                AND completed = FALSE`,
                [userId]
            );
        } catch (error) {
            console.error('Error cleaning up old tasks:', error);
            throw error;
        }
    }

    // 随机选择任务
    getRandomTasks(tasks, count) {
        const shuffled = [...tasks].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // 完成任务
    async completeTask(userId, taskId) {
        try {
            // 检查任务是否存在且未完成
            const [userTask] = await db.query(
                `SELECT ut.*, dt.points_reward, dt.experience_reward, dt.item_reward_id
                FROM user_tasks ut
                JOIN daily_tasks dt ON ut.task_id = dt.id
                WHERE ut.user_id = ? AND ut.task_id = ? AND ut.completed = FALSE`,
                [userId, taskId]
            );

            if (!userTask.length) {
                throw new Error('Task not found or already completed');
            }

            const task = userTask[0];

            // 标记任务为已完成
            await db.query(
                `UPDATE user_tasks 
                SET completed = TRUE, 
                    completed_at = CURRENT_TIMESTAMP 
                WHERE user_id = ? AND task_id = ?`,
                [userId, taskId]
            );

            // 奖励用户
            await db.query(
                `UPDATE user 
                SET points = points + ?,
                    experience = experience + ?
                WHERE id = ?`,
                [task.points_reward, task.experience_reward, userId]
            );

            // 如果有道具奖励，添加到用户道具
            if (task.item_reward_id) {
                await db.query(
                    'INSERT INTO user_items (user_id, item_id) VALUES (?, ?)',
                    [userId, task.item_reward_id]
                );
            }

            return {
                points: task.points_reward,
                experience: task.experience_reward,
                itemReward: task.item_reward_id
            };
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    }

    // 获取用户当日任务
    async getUserDailyTasks(userId) {
        try {
            const [tasks] = await db.query(
                `SELECT ut.*, dt.title, dt.description, 
                    dt.points_reward, dt.experience_reward, dt.item_reward_id
                FROM user_tasks ut
                JOIN daily_tasks dt ON ut.task_id = dt.id
                WHERE ut.user_id = ? 
                AND DATE(ut.assigned_at) = CURDATE()`,
                [userId]
            );
            return tasks;
        } catch (error) {
            console.error('Error getting user daily tasks:', error);
            throw error;
        }
    }

    // 检查任务完成条件
    async checkTaskCompletion(userId, taskId, diaryContent) {
        try {
            const [task] = await db.query(
                'SELECT * FROM daily_tasks WHERE id = ?',
                [taskId]
            );

            if (!task.length) {
                return false;
            }

            // 这里可以根据任务类型添加不同的检查逻辑
            // 例如：检查日记字数、是否包含特定关键词等
            const wordCount = diaryContent.split(' ').length;
            
            // 示例：如果任务要求写满100字
            if (task[0].type === 'WORD_COUNT' && wordCount >= 100) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking task completion:', error);
            throw error;
        }
    }
}

module.exports = new DailyTaskService(); 