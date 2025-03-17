const db = require('../config/database');
const achievementService = require('./achievement.service');
const dailyTaskService = require('./dailyTask.service');
const { calculateTaskReward } = require('../utils/gameLogic');

class DiaryService {
    // 创建日记
    async createDiary(userId, diaryData) {
        try {
            // 开始事务
            await db.beginTransaction();

            // 计算经验值奖励（基于内容长度）
            const wordCount = diaryData.content.split(' ').length;
            const experienceGained = Math.floor(wordCount / 10) * 10; // 每10个字10点经验

            // 创建日记
            const [result] = await db.query(
                `INSERT INTO diaries 
                (user_id, title, content, mood, weather, is_public, is_time_capsule, unlock_time, experience_gained) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    diaryData.title,
                    diaryData.content,
                    diaryData.mood,
                    diaryData.weather,
                    diaryData.isPublic || false,
                    diaryData.isTimeCapsule || false,
                    diaryData.unlockTime || null,
                    experienceGained
                ]
            );

            // 更新用户经验值
            await db.query(
                'UPDATE user SET experience = experience + ? WHERE id = ?',
                [experienceGained, userId]
            );

            // 检查任务完成情况
            const tasks = await dailyTaskService.getUserDailyTasks(userId);
            for (const task of tasks) {
                const isCompleted = await dailyTaskService.checkTaskCompletion(
                    userId,
                    task.id,
                    diaryData.content
                );
                if (isCompleted) {
                    await dailyTaskService.completeTask(userId, task.id);
                }
            }

            // 检查成就
            const newAchievements = await achievementService.checkAchievements(userId);

            // 提交事务
            await db.commit();

            return {
                diaryId: result.insertId,
                experienceGained,
                newAchievements
            };
        } catch (error) {
            // 回滚事务
            await db.rollback();
            console.error('Error creating diary:', error);
            throw error;
        }
    }

    // 获取用户的日记列表
    async getUserDiaries(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const [diaries] = await db.query(
                `SELECT d.*, 
                    COUNT(ds.id) as sticker_count,
                    COUNT(dc.id) as collaborator_count
                FROM diaries d
                LEFT JOIN diary_stickers ds ON d.id = ds.diary_id
                LEFT JOIN diary_collaborators dc ON d.id = dc.diary_id
                WHERE d.user_id = ?
                    AND (d.is_time_capsule = FALSE 
                        OR (d.is_time_capsule = TRUE 
                            AND d.unlock_time <= CURRENT_TIMESTAMP))
                GROUP BY d.id
                ORDER BY d.created_at DESC
                LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );

            const [total] = await db.query(
                'SELECT COUNT(*) as count FROM diaries WHERE user_id = ?',
                [userId]
            );

            return {
                diaries,
                total: total[0].count,
                page,
                totalPages: Math.ceil(total[0].count / limit)
            };
        } catch (error) {
            console.error('Error getting user diaries:', error);
            throw error;
        }
    }

    // 获取单篇日记详情
    async getDiaryDetail(diaryId, userId) {
        try {
            // 获取日记基本信息
            const [diary] = await db.query(
                `SELECT d.*, 
                    u.username as author_name,
                    u.avatar_url as author_avatar
                FROM diaries d
                JOIN user u ON d.user_id = u.id
                WHERE d.id = ?`,
                [diaryId]
            );

            if (!diary.length) {
                throw new Error('Diary not found');
            }

            // 检查访问权限
            if (diary[0].user_id !== userId && !diary[0].is_public) {
                const [collaborator] = await db.query(
                    'SELECT * FROM diary_collaborators WHERE diary_id = ? AND user_id = ?',
                    [diaryId, userId]
                );
                if (!collaborator.length) {
                    throw new Error('Access denied');
                }
            }

            // 获取贴纸信息
            const [stickers] = await db.query(
                `SELECT ds.*, i.content_url, i.name
                FROM diary_stickers ds
                JOIN items i ON ds.item_id = i.id
                WHERE ds.diary_id = ?`,
                [diaryId]
            );

            // 获取协作者信息
            const [collaborators] = await db.query(
                `SELECT dc.*, u.username, u.avatar_url
                FROM diary_collaborators dc
                JOIN user u ON dc.user_id = u.id
                WHERE dc.diary_id = ?`,
                [diaryId]
            );

            return {
                ...diary[0],
                stickers,
                collaborators
            };
        } catch (error) {
            console.error('Error getting diary detail:', error);
            throw error;
        }
    }

    // 更新日记
    async updateDiary(diaryId, userId, updateData) {
        try {
            // 检查权限
            const [diary] = await db.query(
                'SELECT * FROM diaries WHERE id = ?',
                [diaryId]
            );

            if (!diary.length || diary[0].user_id !== userId) {
                throw new Error('Access denied');
            }

            // 更新日记
            await db.query(
                `UPDATE diaries 
                SET title = ?, 
                    content = ?, 
                    mood = ?, 
                    weather = ?, 
                    is_public = ?, 
                    is_time_capsule = ?, 
                    unlock_time = ?
                WHERE id = ?`,
                [
                    updateData.title,
                    updateData.content,
                    updateData.mood,
                    updateData.weather,
                    updateData.isPublic,
                    updateData.isTimeCapsule,
                    updateData.unlockTime,
                    diaryId
                ]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating diary:', error);
            throw error;
        }
    }

    // 删除日记
    async deleteDiary(diaryId, userId) {
        try {
            // 检查权限
            const [diary] = await db.query(
                'SELECT * FROM diaries WHERE id = ?',
                [diaryId]
            );

            if (!diary.length || diary[0].user_id !== userId) {
                throw new Error('Access denied');
            }

            // 开始事务
            await db.beginTransaction();

            // 删除相关的贴纸
            await db.query(
                'DELETE FROM diary_stickers WHERE diary_id = ?',
                [diaryId]
            );

            // 删除协作者记录
            await db.query(
                'DELETE FROM diary_collaborators WHERE diary_id = ?',
                [diaryId]
            );

            // 删除日记
            await db.query(
                'DELETE FROM diaries WHERE id = ?',
                [diaryId]
            );

            // 提交事务
            await db.commit();

            return { success: true };
        } catch (error) {
            // 回滚事务
            await db.rollback();
            console.error('Error deleting diary:', error);
            throw error;
        }
    }

    // 添加协作者
    async addCollaborator(diaryId, userId, collaboratorId, permission = 'read') {
        try {
            // 检查日记所有权
            const [diary] = await db.query(
                'SELECT * FROM diaries WHERE id = ? AND user_id = ?',
                [diaryId, userId]
            );

            if (!diary.length) {
                throw new Error('Access denied');
            }

            // 添加协作者
            await db.query(
                `INSERT INTO diary_collaborators (diary_id, user_id, permission)
                VALUES (?, ?, ?)`,
                [diaryId, collaboratorId, permission]
            );

            return { success: true };
        } catch (error) {
            console.error('Error adding collaborator:', error);
            throw error;
        }
    }

    // 获取用户的心情统计
    async getMoodStats(userId, startDate, endDate) {
        try {
            const [stats] = await db.query(
                `SELECT mood, COUNT(*) as count
                FROM diaries
                WHERE user_id = ?
                    AND created_at BETWEEN ? AND ?
                GROUP BY mood`,
                [userId, startDate, endDate]
            );

            return stats;
        } catch (error) {
            console.error('Error getting mood stats:', error);
            throw error;
        }
    }

    // 获取指定月份的日记
    async getMonthDiaries(userId, year, month) {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const query = `
          SELECT d.*, 
                 u.username as author_name,
                 COUNT(DISTINCT l.id) as likes_count,
                 COUNT(DISTINCT c.id) as comments_count
          FROM diaries d
          LEFT JOIN user u ON d.user_id = u.id
          LEFT JOIN diary_likes l ON d.id = l.diary_id
          LEFT JOIN diary_comments c ON d.id = c.diary_id
          WHERE d.user_id = ?
          AND d.date BETWEEN ? AND ?
          GROUP BY d.id
          ORDER BY d.date DESC
        `;
        
        try {
          const diaries = await db.query(query, [userId, startDate, endDate]);
          return diaries;
        } catch (error) {
          console.error('Error in getMonthDiaries:', error);
          throw error;
        }
    }

    // 获取指定日期的日记
    async getDiaryByDate(userId, date) {
        const query = `
          SELECT d.*, 
                 u.username as author_name,
                 COUNT(DISTINCT l.id) as likes_count,
                 COUNT(DISTINCT c.id) as comments_count
          FROM diaries d
          LEFT JOIN user u ON d.user_id = u.id
          LEFT JOIN diary_likes l ON d.id = l.diary_id
          LEFT JOIN diary_comments c ON d.id = c.diary_id
          WHERE d.user_id = ?
          AND d.date = ?
          GROUP BY d.id
        `;
        
        try {
          const [diary] = await db.query(query, [userId, date]);
          return diary || null;
        } catch (error) {
          console.error('Error in getDiaryByDate:', error);
          throw error;
        }
    }

    // 保存日记
    async saveDiary(userId, diaryData) {
        const { date, content, mood, weather } = diaryData;
        
        try {
          // 检查是否已存在该日期的日记
          const existingDiary = await this.getDiaryByDate(userId, date);
          
          if (existingDiary) {
            // 更新现有日记
            const query = `
              UPDATE diaries
              SET content = ?,
                  mood = ?,
                  weather = ?,
                  date = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `;
            
            await db.query(query, [content, mood, weather, date, existingDiary.id]);
            return { id: existingDiary.id };
          } else {
            // 创建新日记
            const query = `
              INSERT INTO diaries (user_id, date, content, mood, weather)
              VALUES (?, ?, ?, ?, ?)
            `;
            
            const result = await db.query(query, [userId, date, content, mood, weather]);
            return { id: result.insertId };
          }
        } catch (error) {
          console.error('Error in saveDiary:', error);
          throw error;
        }
    }

    // 删除日记
    async deleteDiary(userId, date) {
        try {
          const query = `
            DELETE FROM diaries
            WHERE user_id = ?
            AND date = ?
          `;
          
          await db.query(query, [userId, date]);
        } catch (error) {
          console.error('Error in deleteDiary:', error);
          throw error;
        }
    }

    // 获取日记统计信息
    async getDiaryStats(userId, startDate, endDate) {
        const query = `
          SELECT 
            COUNT(*) as total_count,
            AVG(mood) as avg_mood,
            COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) as streak_months
          FROM diaries
          WHERE user_id = ?
          AND date BETWEEN ? AND ?
        `;
        
        try {
          const [stats] = await db.query(query, [userId, startDate, endDate]);
          return stats;
        } catch (error) {
          console.error('Error in getDiaryStats:', error);
          throw error;
        }
    }
}

module.exports = new DiaryService(); 