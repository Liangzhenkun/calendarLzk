import { defineStore } from 'pinia';
import { getAllAchievements, getUserAchievements, checkAchievementProgress, getAchievementStreak, recalculateStreak } from '@/api/achievements';
import { ElMessage, ElNotification } from 'element-plus';
import { Edit, Calendar, Star, Document } from '@element-plus/icons-vue';

export const useAchievementStore = defineStore('achievement', {
  state: () => ({
    achievements: [],
    userAchievements: [],
    unlockedAchievements: [], // 已解锁的成就ID列表
    achievementProgress: {}, // 成就进度
    unlockDates: {}, // 成就解锁日期
    loading: false,
    error: null,
    currentStreak: 0,
    dailyStreak: 0, // 连续日记天数
    totalDiaries: 0, // 总日记数
    lastFetch: null, // 上次获取成就的时间
    lastCheck: null
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
    },
    getAchievementsByType: (state) => (type) => {
      return state.achievements.filter(a => a.type === type);
    },
    completedCount: (state) => {
      return state.achievements.filter(a => a.completed).length;
    },
    totalCount: (state) => {
      return state.achievements.length;
    }
  },

  actions: {
    // 初始化store
    initStore() {
      // 从localStorage加载数据
      const savedState = localStorage.getItem('achievementStore');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.achievements = state.achievements || [];
        this.userAchievements = state.userAchievements || [];
        this.unlockedAchievements = state.unlockedAchievements || [];
        this.unlockDates = state.unlockDates || {};
        this.currentStreak = state.currentStreak || 0;
        this.lastCheck = state.lastCheck || null;
      }
    },

    // 保存状态到localStorage
    saveState() {
      const state = {
        achievements: this.achievements,
        userAchievements: this.userAchievements,
        unlockedAchievements: this.unlockedAchievements,
        unlockDates: this.unlockDates,
        currentStreak: this.currentStreak,
        lastCheck: this.lastCheck
      };
      localStorage.setItem('achievementStore', JSON.stringify(state));
    },

    // 获取成就列表
    async fetchAchievements() {
      try {
        console.log('开始获取成就列表...');
        const [achievementsResponse, userAchievementsResponse] = await Promise.all([
          getAllAchievements(),
          getUserAchievements()
        ]);

        this.achievements = achievementsResponse.data;
        this.userAchievements = userAchievementsResponse.data;

        // 处理用户成就数据
        this.processUserAchievements();
        
        // 保存到localStorage
        this.saveState();
        
        return true;
      } catch (error) {
        console.error('获取成就列表失败:', error);
        return false;
      }
    },

    // 处理用户成就数据
    processUserAchievements() {
      if (!this.achievements || !this.userAchievements) return;

      this.achievements = this.achievements.map(achievement => {
        const userAchievement = this.userAchievements.find(ua => ua.achievement_id === achievement.id);
        if (userAchievement) {
          // 更新成就状态
          achievement.completed = userAchievement.completed;
          achievement.progress = userAchievement.current_value;
          achievement.completed_at = userAchievement.completed_at;

          // 如果成就已完成，添加到已解锁列表
          if (userAchievement.completed && !this.unlockedAchievements.includes(achievement.id)) {
            this.unlockedAchievements.push(achievement.id);
            this.unlockDates[achievement.id] = userAchievement.completed_at;
          }
        }
        return achievement;
      });

      // 特别处理"启程之日"成就
      this.checkFirstDayAchievement();
      
      // 保存更新后的状态
      this.saveState();
    },

    // 检查"启程之日"成就
    checkFirstDayAchievement() {
      const firstDayAchievement = this.achievements.find(a => a.name === '启程之日' || a.id === 1);
      if (!firstDayAchievement) {
        console.log('未找到"启程之日"成就');
        return;
      }

      const userFirstDayAchievement = this.userAchievements.find(ua => ua.achievement_id === 1);
      if (!userFirstDayAchievement) {
        // 如果用户有日记但没有成就记录，自动添加
        this.checkAndCreateFirstDayAchievement();
        return;
      }

      // 更新成就状态
      const achievementIndex = this.achievements.findIndex(a => a.id === 1);
      if (achievementIndex !== -1) {
        this.achievements[achievementIndex] = {
          ...this.achievements[achievementIndex],
          completed: true,
          progress: userFirstDayAchievement.current_value || 1,
          completed_at: userFirstDayAchievement.completed_at
        };

        if (!this.unlockedAchievements.includes(1)) {
          this.unlockedAchievements.push(1);
          this.unlockDates[1] = userFirstDayAchievement.completed_at;
        }

        // 保存状态
        this.saveState();
      }
    },

    // 检查并创建"启程之日"成就
    async checkAndCreateFirstDayAchievement() {
      try {
        // 检查用户是否有日记
        const response = await getUserAchievements();
        const diaryCount = response.data.length;

        if (diaryCount > 0) {
          // 触发成就检查
          await getUserAchievements();
          // 重新获取成就列表
          await this.fetchAchievements();
        }
      } catch (error) {
        console.error('检查首篇日记成就失败:', error);
      }
    },

    // 获取当前连续天数
    async getCurrentStreak() {
      try {
        console.log('获取当前连续打卡天数...');
        const response = await getAchievementStreak();
        const { currentStreak } = response.data;
        
        // 更新store中的连续天数
        this.currentStreak = currentStreak || 0;
        this.dailyStreak = currentStreak || 0;
        
        console.log(`当前连续打卡天数: ${this.currentStreak}天`);
        return this.currentStreak;
      } catch (error) {
        console.error('获取连续打卡天数失败:', error);
        return 0;
      }
    },

    // 检查成就进度
    async checkAchievementProgress() {
      try {
        console.log('检查成就进度...');
        
        try {
          const response = await checkAchievementProgress();
          const { newAchievements } = response.data;
          
          console.log('成就检查响应:', response.data);
          
          if (newAchievements && newAchievements.length > 0) {
            // 显示通知
            this.showAchievementNotifications(newAchievements);
            
            // 重新获取成就数据
            await this.fetchAchievements();
            
            return newAchievements;
          }
          
          return [];
        } catch (error) {
          console.error('API调用检查成就进度失败:', error);
          // API调用失败，尝试在前端检查
          console.log('尝试在前端检查成就进度...');
          
          // 前端检查连续打卡成就
          this.checkStreakAchievements(this.currentStreak);
          
          // 返回空数组
          return [];
        }
      } catch (error) {
        console.error('检查成就进度失败:', error);
        return [];
      }
    },

    showAchievementNotifications(achievements) {
      if (!achievements || !achievements.length) return;
      
      achievements.forEach(achievement => {
        ElNotification({
          title: '🎉 成就解锁',
          message: `恭喜解锁成就：${achievement.name}！\n${achievement.description}`,
          type: 'success',
          duration: 5000,
          position: 'top-right',
          showClose: true,
          onClick: () => {
            const router = this.router;
            if (router) {
              router.push('/achievement');
            }
          }
        });
        
        ElMessage({
          message: `恭喜解锁成就：${achievement.name}！`,
          type: 'success',
          duration: 3000,
          showClose: true
        });
      });
    },

    unlockAchievement(achievement) {
      if (!this.unlockedAchievements.includes(achievement.id)) {
        this.unlockedAchievements.push(achievement.id);
        this.unlockDates[achievement.id] = new Date();
        
        const achievementIndex = this.achievements.findIndex(a => a.id === achievement.id);
        if (achievementIndex !== -1) {
          this.achievements[achievementIndex] = {
            ...this.achievements[achievementIndex],
            completed: true,
            completed_at: new Date()
          };
          
          this.showAchievementNotifications([achievement]);
        }
      }
    },
    
    getAchievementIcon(achievement) {
      if (!achievement) return null;
      
      const iconName = achievement.icon_url;
      const iconMap = {
        'Edit': Edit,
        'Calendar': Calendar,
        'Star': Star,
        'Document': Document
      };
      
      return iconMap[iconName] || Star;
    },
    
    startPeriodicCheck() {
      // 改为更频繁的检查间隔 - 5分钟一次
      const checkInterval = 5 * 60 * 1000;
      
      console.log('启动成就定期检查，间隔为5分钟');
      
      // 设置定期检查定时器
      const timer = setInterval(async () => {
        const now = new Date();
        const lastFetch = this.lastFetch || new Date(0);
        
        // 检查是否到达检查时间
        if (now - lastFetch > checkInterval) {
          console.log('定时检查成就进度...');
          this.lastFetch = now;
          await this.checkAchievementProgress();
        }
      }, checkInterval);
      
      // 添加页面可见性变化检查，当用户重新回到页面时立即检查成就
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', async () => {
          if (document.visibilityState === 'visible') {
            console.log('用户回到页面，立即检查成就进度...');
            await this.checkAchievementProgress();
          }
        });
      }
      
      return timer; // 返回定时器引用，以便可以在必要时清除
    },

    checkStreakAchievements(streakDays) {
      console.log(`检查连续打卡成就，当前连续天数: ${streakDays}天`);
      
      if (!streakDays || streakDays <= 0) {
        console.log('连续打卡天数为0，无法解锁连续打卡成就');
        return;
      }
      
      const streakAchievements = this.achievements.filter(a => a.type === 'streak');
      console.log('所有连续打卡成就:', streakAchievements);
      
      streakAchievements.forEach(achievement => {
        if (achievement.name === '启程之日') {
          return;
        }
        
        const requiredDays = achievement.required_value || 0;
        console.log(`检查成就 ${achievement.name}, 需要 ${requiredDays}天, 当前 ${streakDays}天`);
        
        if (streakDays >= requiredDays) {
          const achievementIndex = this.achievements.findIndex(a => a.id === achievement.id);
          if (achievementIndex !== -1) {
            if (!this.achievements[achievementIndex].completed) {
              console.log(`成就 ${achievement.name} 满足条件，标记为已完成`);
              
              this.achievements[achievementIndex].completed = true;
              this.achievements[achievementIndex].completed_at = new Date();
              this.achievements[achievementIndex].progress = streakDays;
              
              if (!this.unlockedAchievements.includes(achievement.id)) {
                this.unlockedAchievements.push(achievement.id);
                this.unlockDates[achievement.id] = new Date();
                
                this.showAchievementNotifications([this.achievements[achievementIndex]]);
              }
            }
          }
        } else {
          const achievementIndex = this.achievements.findIndex(a => a.id === achievement.id);
          if (achievementIndex !== -1) {
            this.achievements[achievementIndex].progress = streakDays;
            this.achievementProgress[achievement.id] = streakDays;
          }
        }
      });
    },

    // 实时检查成就的方法（自动包含连续天数计算）
    async checkAchievementsRealTime(event) {
      try {
        console.log(`触发实时成就检查，事件类型: ${event}`);
        
        // 先重新计算连续天数
        console.log('重新计算连续天数...');
        try {
          await this.recalculateStreak();
          console.log(`连续天数计算完成: ${this.currentStreak}天`);
        } catch (error) {
          console.error('重新计算连续天数失败，但继续检查其他成就:', error);
        }
        
        // 然后检查成就进度
        const newAchievements = await this.checkAchievementProgress();
        
        // 如果有新成就，显示通知
        if (newAchievements && newAchievements.length > 0) {
          this.showAchievementNotifications(newAchievements);
        }
        
        return newAchievements;
      } catch (error) {
        console.error('实时检查成就失败:', error);
        return [];
      }
    },

    // 重新计算连续天数
    async recalculateStreak() {
      try {
        console.log('请求重新计算连续打卡天数...');
        
        // 调用后端API重新计算连续天数
        const response = await recalculateStreak();
        const { streak, updatedAchievements } = response.data;
        
        console.log(`连续打卡天数重新计算结果: ${streak}天`, updatedAchievements);
        
        // 更新状态
        this.currentStreak = streak;
        this.dailyStreak = streak;
        
        // 如果有更新的成就，显示通知
        if (updatedAchievements && updatedAchievements.length > 0) {
          this.showAchievementNotifications(updatedAchievements);
        }
        
        // 刷新成就列表，确保UI显示最新状态
        await this.fetchAchievements();
        
        return streak;
      } catch (error) {
        console.error('重新计算连续打卡天数失败:', error);
        throw error;
      }
    }
  }
}); 