<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth">&lt;</button>
      <h2>{{ currentMonthYear }}</h2>
      <button @click="nextMonth">&gt;</button>
    </div>
    
    <div class="calendar-grid">
      <div class="weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
      <div
        v-for="date in calendarDays"
        :key="date.date"
        class="calendar-day"
        :class="{
          'other-month': !date.isCurrentMonth,
          'has-diary': date.hasDiary,
          'today': isToday(date.date)
        }"
        @dblclick="openDiaryDialog(date)"
      >
        <span class="date-number">{{ date.dayOfMonth }}</span>
        <div v-if="date.hasDiary" class="diary-indicator">
          <i class="diary-icon"></i>
        </div>
      </div>
    </div>

    <!-- 记事对话框 -->
    <el-dialog
      v-model="diaryDialogVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="diary-form">
        <el-form :model="diaryForm" label-width="80px">
          <el-form-item label="心情">
            <el-rate v-model="diaryForm.mood" :colors="moodColors"></el-rate>
          </el-form-item>
          <el-form-item label="天气">
            <el-select v-model="diaryForm.weather" placeholder="选择天气">
              <el-option
                v-for="item in weatherOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <i :class="item.icon"></i>
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="diaryForm.content"
              type="textarea"
              :rows="6"
              placeholder="写下今天的故事..."
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="diaryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDiary">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useDiaryStore } from '@/stores/diary';

const diaryStore = useDiaryStore();
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const currentDate = ref(new Date());
const diaryDialogVisible = ref(false);
const selectedDate = ref(null);

const diaryForm = ref({
  date: '',
  mood: 3,
  weather: 'sunny',
  content: ''
});

const weatherOptions = [
  { value: 'sunny', label: '晴天', icon: 'weather-sunny' },
  { value: 'cloudy', label: '多云', icon: 'weather-cloudy' },
  { value: 'rainy', label: '下雨', icon: 'weather-rainy' },
  { value: 'snowy', label: '下雪', icon: 'weather-snowy' }
];

const moodColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FF6666', '#FF3333'];

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString('zh-CN', { year: 'numeric', month: 'long' });
});

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  const startPadding = firstDay.getDay();
  
  try {
    // 添加上个月的日期
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date: date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        hasDiary: diaryStore.hasDiaryOnDate(date)
      });
    }
    
    // 添加当前月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date: date,
        dayOfMonth: i,
        isCurrentMonth: true,
        hasDiary: diaryStore.hasDiaryOnDate(date)
      });
    }
    
    // 添加下个月的日期
    const endPadding = 42 - days.length; // 保持6行
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        hasDiary: diaryStore.hasDiaryOnDate(date)
      });
    }
  } catch (error) {
    console.error('Error generating calendar days:', error);
  }
  
  return days;
});

const dialogTitle = computed(() => {
  if (!selectedDate.value) return '';
  return selectedDate.value.toLocaleDateString('zh-CN') + ' 的日记';
});

const openDiaryDialog = async (dateInfo) => {
  selectedDate.value = dateInfo.date;
  diaryForm.value.date = dateInfo.date.toISOString().split('T')[0];
  
  if (dateInfo.hasDiary) {
    // 获取已有日记内容
    const diary = await diaryStore.getDiaryByDate(dateInfo.date);
    if (diary) {
      diaryForm.value = {
        ...diary,
        date: dateInfo.date.toISOString().split('T')[0]
      };
    }
  } else {
    // 重置表单
    diaryForm.value = {
      date: dateInfo.date.toISOString().split('T')[0],
      mood: 3,
      weather: 'sunny',
      content: ''
    };
  }
  
  diaryDialogVisible.value = true;
};

const saveDiary = async () => {
  try {
    await diaryStore.saveDiary({
      ...diaryForm.value,
      date: selectedDate.value
    });
    
    diaryDialogVisible.value = false;
    ElMessage.success('日记保存成功');
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message);
  }
};

onMounted(async () => {
  // 获取当月的日记数据
  await diaryStore.fetchMonthDiaries(currentDate.value);
});
</script>

<style scoped>
.calendar {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 5px 10px;
  color: #606266;
}

.calendar-header button:hover {
  color: #409EFF;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.weekday {
  padding: 10px;
  text-align: center;
  background: #f5f7fa;
  font-weight: bold;
  color: #606266;
}

.calendar-day {
  position: relative;
  min-height: 100px;
  padding: 5px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.calendar-day:hover {
  background: #f5f7fa;
}

.other-month {
  color: #c0c4cc;
}

.date-number {
  font-size: 0.9em;
  color: #606266;
}

.has-diary {
  background: #ecf5ff;
}

.has-diary .date-number {
  color: #409EFF;
}

.diary-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: #409EFF;
  border-radius: 50%;
}

.today {
  border: 2px solid #409EFF;
}

.diary-form {
  padding: 20px;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 60px;
  }
  
  .el-dialog {
    width: 90% !important;
  }
}
</style> 