const db = require('../config/database');
const { calculateLevel } = require('../utils/gameLogic');

class AchievementService {
    // 检查并触发成就
    async checkAchievements(userId) {
        try {
            // 获取用户数据
            const [user] = await db.query(
                'SELECT * FROM user WHERE id = ?',
                [userId]
            );

            // 获取用户未解锁的成就
            const [unlockedAchievements] = await db.query(
                `SELECT a.* FROM achievements a 
                LEFT JOIN user_achievements ua 
                ON a.id = ua.achievement_id AND ua.user_id = ?
                WHERE ua.id IS NULL`,
                [userId]
            );

            const newAchievements = [];

            // 检查每个未解锁的成就
            for (const achievement of unlockedAchievements) {
                const isUnlocked = await this.checkAchievementCondition(userId, achievement);
                if (isUnlocked) {
                    await this.unlockAchievement(userId, achievement.id);
                    newAchievements.push(achievement);
                }
            }

            return newAchievements;
        } catch (error) {
            console.error('Error checking achievements:', error);
            throw error;
        }
    }

    // 检查特定成就条件
    async checkAchievementCondition(userId, achievement) {
        try {
            switch (achievement.type) {
                case 'DIARY_COUNT':
                    const [diaryCount] = await db.query(
                        'SELECT COUNT(*) as count FROM diaries WHERE user_id = ?',
                        [userId]
                    );
                    return diaryCount[0].count >= achievement.required_value;

                case 'STREAK_DAYS':
                    const [streakDays] = await db.query(
                        `SELECT COUNT(DISTINCT DATE(created_at)) as count 
                        FROM diaries 
                        WHERE user_id = ? 
                        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
                        [userId, achievement.required_value]
                    );
                    return streakDays[0].count >= achievement.required_value;

                case 'TOTAL_WORDS':
                    const [wordCount] = await db.query(
                        `SELECT SUM(CHAR_LENGTH(content) - CHAR_LENGTH(REPLACE(content, ' ', '')) + 1) as count 
                        FROM diaries 
                        WHERE user_id = ?`,
                        [userId]
                    );
                    return wordCount[0].count >= achievement.required_value;

                default:
                    return false;
            }
        } catch (error) {
            console.error('Error checking achievement condition:', error);
            throw error;
        }
    }

    // 解锁成就
    async unlockAchievement(userId, achievementId) {
        try {
            const [achievement] = await db.query(
                'SELECT * FROM achievements WHERE id = ?',
                [achievementId]
            );

            // 插入用户成就记录
            await db.query(
                'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
                [userId, achievementId]
            );

            // 奖励经验值和积分
            const experienceGained = 100; // 基础经验值
            const pointsGained = 50; // 基础积分

            await db.query(
                `UPDATE user 
                SET experience = experience + ?, 
                    points = points + ? 
                WHERE id = ?`,
                [experienceGained, pointsGained, userId]
            );

            // 检查是否需要升级
            const [user] = await db.query(
                'SELECT experience FROM user WHERE id = ?',
                [userId]
            );

            const newLevel = calculateLevel(user[0].experience);
            await db.query(
                'UPDATE user SET level = ? WHERE id = ?',
                [newLevel, userId]
            );

            return {
                achievement: achievement[0],
                rewards: {
                    experience: experienceGained,
                    points: pointsGained,
                    newLevel
                }
            };
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            throw error;
        }
    }

    // 获取用户已解锁的成就
    async getUserAchievements(userId) {
        try {
            const [achievements] = await db.query(
                `SELECT a.*, ua.unlocked_at 
                FROM achievements a 
                INNER JOIN user_achievements ua 
                ON a.id = ua.achievement_id 
                WHERE ua.user_id = ?`,
                [userId]
            );
            return achievements;
        } catch (error) {
            console.error('Error getting user achievements:', error);
            throw error;
        }
    }
}

module.exports = new AchievementService(); 