import { defineStore } from 'pinia';
import * as diaryApi from '@/api/diary';

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    diaries: new Map(), // 使用 Map 存储日记，key 为日期字符串
    loading: false,
    error: null
  }),

  getters: {
    getDiariesByMonth: (state) => (year, month) => {
      const result = [];
      state.diaries.forEach((diary, dateStr) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
          result.push(diary);
        }
      });
      return result;
    }
  },

  actions: {
    // 获取所有日记
    async fetchDiaries() {
      this.loading = true;
      this.error = null;
      try {
        const response = await diaryApi.getDiaryList();
        
        // 清除所有现有数据
        this.diaries.clear();
        
        // 添加新的日记数据
        if (Array.isArray(response.data)) {
          response.data.forEach(diary => {
            if (diary && diary.date) {
              const dateStr = new Date(diary.date).toISOString().split('T')[0];
              this.diaries.set(dateStr, diary);
            }
          });
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取日记失败';
        console.error('Error fetching diaries:', error);
      } finally {
        this.loading = false;
      }
    },

    // 获取指定月份的日记
    async fetchMonthDiaries(date) {
      if (!date) return;
      
      this.loading = true;
      this.error = null;
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const response = await diaryApi.getDiaryList({ year, month });
        
        // 清除当前月份的日记数据
        this.clearMonthDiaries(year, month);
        
        // 添加新的日记数据
        if (Array.isArray(response.data)) {
          response.data.forEach(diary => {
            if (diary && diary.date) {
              const dateStr = new Date(diary.date).toISOString().split('T')[0];
              this.diaries.set(dateStr, diary);
            }
          });
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取日记失败';
        console.error('Error fetching diaries:', error);
      } finally {
        this.loading = false;
      }
    },

    // 清除指定月份的日记数据
    clearMonthDiaries(year, month) {
      this.diaries.forEach((_, dateStr) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
          this.diaries.delete(dateStr);
        }
      });
    },

    // 根据日期获取日记
    async getDiaryByDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      if (this.diaries.has(dateStr)) {
        return this.diaries.get(dateStr);
      }

      try {
        const response = await diaryApi.getDiaryDetail(dateStr);
        if (response.data) {
          this.diaries.set(dateStr, response.data);
          return response.data;
        }
      } catch (error) {
        console.error('Error fetching diary:', error);
        return null;
      }
    },

    // 检查指定日期是否有日记
    hasDiaryOnDate(date) {
      try {
        if (!date) return false;
        const dateStr = date.toISOString().split('T')[0];
        return this.diaries.has(dateStr);
      } catch (error) {
        console.error('Error checking diary existence:', error);
        return false;
      }
    },

    // 保存日记
    async saveDiary(diary) {
      if (!diary || !diary.date) {
        throw new Error('无效的日记数据');
      }

      try {
        const dateStr = new Date(diary.date).toISOString().split('T')[0];
        const data = {
          ...diary,
          date: dateStr
        };
        
        let response;
        const existingDiary = await this.getDiaryByDate(new Date(dateStr));
        
        if (existingDiary) {
          // 如果存在，使用 PUT 方法更新
          response = await diaryApi.updateDiary(existingDiary.id, data);
        } else {
          // 如果不存在，使用 POST 方法创建
          response = await diaryApi.createDiary(data);
        }
        
        if (response.data) {
          this.diaries.set(dateStr, {
            ...diary,
            ...response.data,
            date: dateStr
          });
        }
        
        return response.data;
      } catch (error) {
        console.error('Error saving diary:', error);
        throw new Error(error.response?.data?.message || '保存日记失败');
      }
    },

    // 删除日记
    async deleteDiary(date) {
      const dateStr = date.toISOString().split('T')[0];
      try {
        await diaryApi.deleteDiary(dateStr);
        this.diaries.delete(dateStr);
      } catch (error) {
        console.error('Error deleting diary:', error);
        throw error;
      }
    }
  }
}); 