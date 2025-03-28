import { defineStore } from 'pinia';
import { getDailyTasks, completeTask, getTaskHistory } from '@/api/dailyTask';

export const useDailyTaskStore = defineStore('dailyTask', {
  state: () => ({
    tasks: [],
    completedTasks: [],
    history: [],
    loading: false,
    error: null
  }),

  getters: {
    getTaskById: (state) => (id) => {
      return state.tasks.find(task => task.id === id);
    },
    isTaskCompleted: (state) => (id) => {
      return state.completedTasks.includes(id);
    },
    todayProgress: (state) => {
      if (state.tasks.length === 0) return 0;
      return (state.completedTasks.length / state.tasks.length) * 100;
    }
  },

  actions: {
    async fetchDailyTasks() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getDailyTasks();
        this.tasks = response.data.tasks;
        this.completedTasks = response.data.completedTasks || [];
      } catch (error) {
        this.error = error.response?.data?.message || '获取每日任务失败';
        console.error('Error fetching daily tasks:', error);
      } finally {
        this.loading = false;
      }
    },

    async completeTask(taskId) {
      if (this.isTaskCompleted(taskId)) return;

      try {
        const response = await completeTask(taskId);
        if (response.data.success) {
          this.completedTasks.push(taskId);
          // 如果有奖励，返回奖励信息
          return response.data.rewards;
        }
      } catch (error) {
        this.error = error.response?.data?.message || '完成任务失败';
        console.error('Error completing task:', error);
      }
    },

    async fetchTaskHistory() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getTaskHistory();
        this.history = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取任务历史失败';
        console.error('Error fetching task history:', error);
      } finally {
        this.loading = false;
      }
    },

    // 重置每日任务状态
    resetDailyTasks() {
      this.completedTasks = [];
    }
  }
}); 