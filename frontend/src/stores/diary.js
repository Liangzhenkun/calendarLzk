import { defineStore } from 'pinia';
import { createDiary, getDiaryList, getDiaryDetail, updateDiary, deleteDiary, getMetrics, getMetricsStats, getMetricsTrend } from '@/api/diary';

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    diaries: new Map(), // 使用 Map 存储日记，key 为日期字符串
    loading: false,
    error: null,
    metrics: {
      current: null,
      stats: null,
      trend: null
    }
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
    },

    // 新增指标相关的getter
    getCurrentMetrics: (state) => state.metrics.current,
    getMetricsStats: (state) => state.metrics.stats,
    getMetricsTrend: (state) => state.metrics.trend
  },

  actions: {
    // 获取所有日记
    async fetchDiaries() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getDiaryList();
        
        // 清除所有现有数据
        this.diaries.clear();
        
        // 添加新的日记数据
        if (Array.isArray(response.data)) {
          response.data.forEach(diary => {
            if (diary && diary.date) {
              // 使用一致的日期格式化方法
              const diaryDate = new Date(diary.date);
              const year = diaryDate.getFullYear();
              const month = String(diaryDate.getMonth() + 1).padStart(2, '0');
              const day = String(diaryDate.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
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
        const response = await getDiaryList({ year, month });
        
        // 清除当前月份的日记数据
        this.clearMonthDiaries(year, month);
        
        // 添加新的日记数据
        if (Array.isArray(response.data)) {
          response.data.forEach(diary => {
            if (diary && diary.date) {
              // 使用一致的日期格式化方法
              const diaryDate = new Date(diary.date);
              const year = diaryDate.getFullYear();
              const month = String(diaryDate.getMonth() + 1).padStart(2, '0');
              const day = String(diaryDate.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
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
        // 从日期字符串解析年、月、日
        const [y, m, d] = dateStr.split('-').map(num => parseInt(num, 10));
        // 注意：JavaScript 中月份是从 0 开始的
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() === year && date.getMonth() === month - 1) {
          this.diaries.delete(dateStr);
        }
      });
    },

    // 根据日期获取日记
    async getDiaryByDate(date) {
      // 使用与 saveDiary 相同的日期格式化方法，确保一致性
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (this.diaries.has(dateStr)) {
        return this.diaries.get(dateStr);
      }

      try {
        const response = await getDiaryDetail(dateStr);
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
        // 使用与 saveDiary 相同的日期格式化方法，确保一致性
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
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
        // 确保日期格式正确
        const date = new Date(diary.date);
        if (isNaN(date.getTime())) {
          throw new Error('无效的日期格式');
        }
        
        // 使用本地时间，避免时区问题
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // 确保其他数据格式正确
        const data = {
          title: diary.title || `${dateStr}的日记`,
          content: diary.content || '',
          date: dateStr,
          mood: parseInt(diary.mood || 3, 10),
          weather: diary.weather || 'sunny',
          metrics: {
            sleepQuality: parseInt(diary.metrics?.sleepQuality || 5, 10),
            stressLevel: parseInt(diary.metrics?.stressLevel || 5, 10),
            productivity: parseInt(diary.metrics?.productivity || 5, 10)
          }
        };
        
        console.log('日记store准备保存数据:', data);
        console.log('检查当前缓存是否存在该日期的日记:', this.diaries.has(dateStr));
        
        let response;
        const existingDiary = this.diaries.get(dateStr);
        
        if (existingDiary) {
          // 如果存在，使用日期更新
          response = await updateDiary(dateStr, data);
        } else {
          // 如果不存在，创建新日记
          response = await createDiary(data);
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
        throw error;
      }
    },

    // 获取指标数据
    async fetchMetricsData(metric, range = 'week') {
      this.loading = true;
      this.error = null;
      try {
        const response = await getMetrics(metric, range);
        this.metrics.current = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取指标数据失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取指标统计数据
    async fetchMetricsStats(startDate, endDate) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getMetricsStats(startDate, endDate);
        this.metrics.stats = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取指标统计失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取指标趋势数据
    async fetchMetricsTrend(metric, period = 'week') {
      this.loading = true;
      this.error = null;
      try {
        const response = await getMetricsTrend(metric, period);
        this.metrics.trend = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || '获取指标趋势失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 删除日记
    async deleteDiary(date) {
      try {
        // 确保日期格式正确
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('无效的日期格式');
        }
        
        // 使用本地时间，避免时区问题
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        console.log('删除日记，日期:', dateStr);
        await deleteDiary(dateStr);
        this.diaries.delete(dateStr);
      } catch (error) {
        console.error('Error deleting diary:', error);
        throw error;
      }
    }
  }
}); 