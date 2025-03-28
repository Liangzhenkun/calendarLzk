import { defineStore } from 'pinia';
import { getAchievements, getUserAchievements, checkProgress } from '@/api/achievement';

export const useAchievementStore = defineStore('achievement', {
  state: () => ({
    achievements: [],
    userAchievements: [],
    unlockedAchievements: [], // 已解锁的成就ID列表
    achievementProgress: {}, // 成就进度
    unlockDates: {}, // 成就解锁日期
    loading: false,
    error: null
  }),

  getters: {
    getAchievementById: (state) => (id) => {
      return state.achievements.find(achievement => achievement.id === id);
    },
    getUserAchievementById: (state) => (id) => {
      return state.userAchievements.find(achievement => achievement.id === id);
    },
    getUnlockDate: (state) => (achievementId) => {
      return state.unlockDates[achievementId];
    },
    getAchievementProgress: (state) => (achievementId) => {
      return state.achievementProgress[achievementId] || 0;
    }
  },

  actions: {
    async getAchievements() {
      await this.fetchAllAchievements();
      return this.achievements;
    },

    async fetchAllAchievements() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getAchievements();
        this.achievements = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取成就列表失败';
        console.error('Error fetching achievements:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserAchievements() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getUserAchievements();
        this.userAchievements = response.data;
        
        // 更新已解锁成就和解锁日期
        this.unlockedAchievements = response.data.map(a => a.id);
        response.data.forEach(a => {
          this.unlockDates[a.id] = a.unlock_date;
        });
      } catch (error) {
        this.error = error.response?.data?.message || '获取用户成就失败';
        console.error('Error fetching user achievements:', error);
      } finally {
        this.loading = false;
      }
    },

    async checkAchievementProgress() {
      try {
        const response = await checkProgress();
        // 更新成就进度
        if (response.data.progress) {
          this.achievementProgress = {
            ...this.achievementProgress,
            ...response.data.progress
          };
        }
        
        // 处理新解锁的成就
        if (response.data.newAchievements?.length > 0) {
          response.data.newAchievements.forEach(achievement => {
            this.unlockAchievement(achievement);
          });
          // 更新用户成就列表
          await this.fetchUserAchievements();
          return response.data.newAchievements;
        }
        return [];
      } catch (error) {
        console.error('Error checking achievement progress:', error);
        return [];
      }
    },

    // 解锁成就
    unlockAchievement(achievement) {
      if (!this.unlockedAchievements.includes(achievement.id)) {
        this.unlockedAchievements.push(achievement.id);
        this.unlockDates[achievement.id] = new Date().toISOString();
        // 触发订阅事件
        this.$patch({
          type: 'unlockAchievement',
          payload: { achievementId: achievement.id }
        });
      }
    }
  }
}); 