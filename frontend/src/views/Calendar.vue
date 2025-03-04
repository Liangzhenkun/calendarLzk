<template>
  <div class="calendar">
    <div class="calendar-header">
      <div class="month-navigation">
        <el-button @click="previousMonth">上个月</el-button>
        <h2>{{ currentYear }}年{{ currentMonth + 1 }}月</h2>
        <el-button @click="nextMonth">下个月</el-button>
      </div>
    </div>

    <div class="calendar-body">
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      
      <div class="days">
        <div
          v-for="{ date, isCurrentMonth, hasDiary } in calendarDays"
          :key="date.toISOString()"
          class="day"
          :class="{
            'other-month': !isCurrentMonth,
            'has-diary': hasDiary,
            'is-today': isToday(date)
          }"
          @dblclick="openDiaryDialog({ date, hasDiary })"
        >
          <span class="day-number">{{ date.getDate() }}</span>
          <div class="day-content" v-if="hasDiary">
            <i class="el-icon-notebook-2"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 日记对话框 -->
    <el-dialog
      v-model="diaryDialogVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="diary-form">
        <el-form :model="diaryForm" label-width="80px">
          <el-form-item label="标题">
            <el-input
              v-model="diaryForm.title"
              placeholder="请输入日记标题..."
            ></el-input>
          </el-form-item>
          
          <el-form-item label="心情">
            <el-rate
              v-model="diaryForm.mood"
              :colors="moodColors"
              :texts="moodTexts"
              show-text
            ></el-rate>
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

// 心情相关配置
const moodColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FF6666', '#FF0000'];
const moodTexts = ['失落', '平静', '还好', '开心', '超棒'];

// 天气选项
const weatherOptions = [
  { value: 'sunny', label: '晴天', icon: 'el-icon-sunny' },
  { value: 'cloudy', label: '多云', icon: 'el-icon-cloudy' },
  { value: 'rainy', label: '下雨', icon: 'el-icon-lightning' },
  { value: 'snowy', label: '下雪', icon: 'el-icon-heavy-rain' }
];

const diaryForm = ref({
  date: '',
  title: '',
  mood: 3,
  weather: 'sunny',
  content: ''
});

// 计算属性
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const dialogTitle = computed(() => {
  const date = selectedDate.value;
  return date ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日的日记` : '';
});

// 日历数据
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  const startDay = new Date(firstDay);
  startDay.setDate(startDay.getDate() - startDay.getDay());
  
  while (days.length < 42) {
    const date = new Date(startDay);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      hasDiary: diaryStore.hasDiaryOnDate(date)
    });
    startDay.setDate(startDay.getDate() + 1);
  }
  
  return days;
});

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

// 日历导航方法
const previousMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

// 判断是否是今天
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// 打开日记对话框
const openDiaryDialog = async ({ date, hasDiary }) => {
  selectedDate.value = date;
  const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  
  diaryForm.value = {
    date,
    title: `${formattedDate}的日记`,  // 设置默认标题
    mood: 3,
    weather: 'sunny',
    content: ''
  };
  
  if (hasDiary) {
    const diary = await diaryStore.getDiaryByDate(date);
    if (diary) {
      diaryForm.value = { ...diary };
    }
  }
  
  diaryDialogVisible.value = true;
};

// 组件挂载时初始化数据
onMounted(async () => {
  await diaryStore.fetchDiaries();
});
</script>

<style scoped>
.calendar {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.calendar-header {
  margin-bottom: 20px;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.calendar-body {
  margin-top: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  aspect-ratio: 1;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.day:hover {
  background-color: #f5f7fa;
}

.day.other-month {
  color: #909399;
}

.day.has-diary {
  background-color: #ecf5ff;
}

.day.is-today {
  border-color: #409eff;
  color: #409eff;
}

.day-number {
  position: absolute;
  top: 5px;
  left: 5px;
}

.day-content {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.diary-form {
  margin-top: 20px;
}
</style> 