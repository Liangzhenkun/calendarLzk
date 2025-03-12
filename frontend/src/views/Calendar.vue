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
          
          <!-- 个性化数值记录 -->
          <el-divider>个性化指标记录</el-divider>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="睡眠质量">
                <el-rate
                  v-model="diaryForm.metrics.sleepQuality"
                  :colors="metricColors"
                  :texts="sleepQualityTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="能量水平">
                <el-rate
                  v-model="diaryForm.metrics.energyLevel"
                  :colors="metricColors"
                  :texts="energyLevelTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="压力水平">
                <el-rate
                  v-model="diaryForm.metrics.stressLevel"
                  :colors="metricColors.slice().reverse()"
                  :texts="stressLevelTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工作效率">
                <el-rate
                  v-model="diaryForm.metrics.productivity"
                  :colors="metricColors"
                  :texts="productivityTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="运动时长">
                <el-input-number
                  v-model="diaryForm.metrics.exerciseMinutes"
                  :min="0"
                  :max="480"
                  :step="5"
                  placeholder="运动时长（分钟）"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="喝水杯数">
                <el-input-number
                  v-model="diaryForm.metrics.waterCups"
                  :min="0"
                  :max="20"
                  :step="1"
                  placeholder="喝水杯数"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="心情指数">
                <el-rate
                  v-model="diaryForm.metrics.moodScore"
                  :max="10"
                  :colors="metricColors"
                  :texts="moodScoreTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="社交满意度">
                <el-rate
                  v-model="diaryForm.metrics.socialSatisfaction"
                  :max="10"
                  :colors="metricColors"
                  :texts="socialSatisfactionTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="家庭指数">
                <el-rate
                  v-model="diaryForm.metrics.familyIndex"
                  :max="10"
                  :colors="metricColors"
                  :texts="familyIndexTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="健康指数">
                <el-rate
                  v-model="diaryForm.metrics.healthScore"
                  :max="10"
                  :colors="metricColors"
                  :texts="healthScoreTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>
          
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

    <!-- 阅读模式对话框 -->
    <el-dialog
      v-model="readDialogVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="diary-read">
        <div class="diary-header">
          <h3>{{ diaryForm.title }}</h3>
          <div class="diary-meta">
            <el-rate
              v-model="diaryForm.mood"
              :colors="moodColors"
              :texts="moodTexts"
              show-text
              disabled
            ></el-rate>
            <div class="weather-display">
              <i :class="getWeatherIcon(diaryForm.weather)"></i>
              {{ getWeatherLabel(diaryForm.weather) }}
            </div>
          </div>
        </div>
        <div class="diary-content">
          {{ diaryForm.content }}
        </div>
        <div class="diary-actions">
          <el-button type="primary" @click="switchToEditMode">编辑日记</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑模式对话框 -->
    <el-dialog
      v-model="editDialogVisible"
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
          
          <!-- 个性化数值记录 -->
          <el-divider>个性化指标记录</el-divider>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="睡眠质量">
                <el-rate
                  v-model="diaryForm.metrics.sleepQuality"
                  :colors="metricColors"
                  :texts="sleepQualityTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="能量水平">
                <el-rate
                  v-model="diaryForm.metrics.energyLevel"
                  :colors="metricColors"
                  :texts="energyLevelTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="压力水平">
                <el-rate
                  v-model="diaryForm.metrics.stressLevel"
                  :colors="metricColors.slice().reverse()"
                  :texts="stressLevelTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工作效率">
                <el-rate
                  v-model="diaryForm.metrics.productivity"
                  :colors="metricColors"
                  :texts="productivityTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="运动时长">
                <el-input-number
                  v-model="diaryForm.metrics.exerciseMinutes"
                  :min="0"
                  :max="480"
                  :step="5"
                  placeholder="运动时长（分钟）"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="喝水杯数">
                <el-input-number
                  v-model="diaryForm.metrics.waterCups"
                  :min="0"
                  :max="20"
                  :step="1"
                  placeholder="喝水杯数"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="心情指数">
                <el-rate
                  v-model="diaryForm.metrics.moodScore"
                  :max="10"
                  :colors="metricColors"
                  :texts="moodScoreTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="社交满意度">
                <el-rate
                  v-model="diaryForm.metrics.socialSatisfaction"
                  :max="10"
                  :colors="metricColors"
                  :texts="socialSatisfactionTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="家庭指数">
                <el-rate
                  v-model="diaryForm.metrics.familyIndex"
                  :max="10"
                  :colors="metricColors"
                  :texts="familyIndexTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="健康指数">
                <el-rate
                  v-model="diaryForm.metrics.healthScore"
                  :max="10"
                  :colors="metricColors"
                  :texts="healthScoreTexts"
                  show-text
                ></el-rate>
              </el-form-item>
            </el-col>
          </el-row>
          
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
          <el-button @click="closeEditDialog">取消</el-button>
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const diaryStore = useDiaryStore();
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const currentDate = ref(new Date());
const diaryDialogVisible = ref(false);
const readDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedDate = ref(null);

// 个性化指标配置
const metricColors = ['#F56C6C', '#E6A23C', '#909399', '#67C23A', '#409EFF'];
const sleepQualityTexts = ['很差', '一般', '正常', '不错', '很好'];
const energyLevelTexts = ['疲惫', '低落', '一般', '充沛', '满满'];
const stressLevelTexts = ['极高', '偏高', '一般', '轻松', '无压'];
const productivityTexts = ['很低', '一般', '正常', '高效', '超高'];

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

// 获取天气图标
const getWeatherIcon = (weather) => {
  const option = weatherOptions.find(opt => opt.value === weather);
  return option ? option.icon : '';
};

// 获取天气标签
const getWeatherLabel = (weather) => {
  const option = weatherOptions.find(opt => opt.value === weather);
  return option ? option.label : '';
};

const diaryForm = ref({
  date: '',
  title: '',
  mood: 3,
  weather: 'sunny',
  content: '',
  metrics: {
    sleepQuality: 3,
    energyLevel: 3,
    stressLevel: 3,
    productivity: 3,
    exerciseMinutes: 0,
    waterCups: 0
  }
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

// 切换到编辑模式
const switchToEditMode = () => {
  readDialogVisible.value = false;
  editDialogVisible.value = true;
};

// 关闭编辑对话框
const closeEditDialog = () => {
  editDialogVisible.value = false;
};

// 打开日记对话框
const openDiaryDialog = async ({ date, hasDiary }) => {
  selectedDate.value = date;
  const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  
  // 确保日期格式正确
  const isoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (hasDiary) {
    // 如果有日记，先获取内容并显示阅读模式
    const diary = await diaryStore.getDiaryByDate(date);
    if (diary) {
      diaryForm.value = { 
        ...diary,
        date: isoDate
      };
      readDialogVisible.value = true;
    }
  } else {
    // 如果没有日记，直接显示编辑模式
    diaryForm.value = {
      date: isoDate,
      title: `${formattedDate}的日记`,
      mood: 3,
      weather: 'sunny',
      content: '',
      metrics: {
        sleepQuality: 3,
        energyLevel: 3,
        stressLevel: 3,
        productivity: 3,
        exerciseMinutes: 0,
        waterCups: 0,
        moodScore: 5,
        socialSatisfaction: 5,
        familyIndex: 5,
        healthScore: 5
      }
    };
    editDialogVisible.value = true;
  }
};

// 保存日记
const saveDiary = async () => {
  try {
    await diaryStore.saveDiary(diaryForm.value);
    editDialogVisible.value = false;
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

// 组件挂载时初始化数据
onMounted(async () => {
  await diaryStore.fetchDiaries();
});

// 在script部分添加新的文本配置
const moodScoreTexts = [
  '非常低落', '很不开心', '不太开心', '一般般', '还可以',
  '比较好', '开心', '很开心', '非常开心', '极其愉悦'
];

const socialSatisfactionTexts = [
  '极不满意', '很不满意', '不太满意', '一般般', '还可以',
  '比较满意', '满意', '很满意', '非常满意', '极其满意'
];

const familyIndexTexts = [
  '非常糟糕', '很不理想', '不太好', '一般般', '还可以',
  '比较好', '和谐', '很和谐', '非常和谐', '完美和谐'
];

const healthScoreTexts = [
  '非常差', '很不好', '不太好', '一般般', '还可以',
  '比较好', '健康', '很健康', '非常健康', '极其健康'
];
</script>

<style scoped>
.calendar {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
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

.month-navigation h2 {
  font-size: 1.5rem;
  margin: 0;
}

.calendar-body {
  margin-top: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  gap: 5px;
  margin-bottom: 10px;
}

.weekday {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  aspect-ratio: 1;
  padding: 5px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.day:hover {
  background: #f5f7fa;
}

.day-number {
  font-size: 1.1em;
  margin-bottom: 5px;
}

.day-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.other-month {
  opacity: 0.5;
}

.has-diary {
  background: #ecf5ff;
  border-color: #409eff;
}

.is-today {
  background: #fff3e6;
  border-color: #ff9900;
}

/* 响应式设计 */
/* 手机屏幕 (小于 480px) */
@media screen and (max-width: 480px) {
  .calendar {
    padding: 10px;
    margin: 10px;
  }

  .month-navigation {
    padding: 0 10px;
  }

  .month-navigation h2 {
    font-size: 1.2rem;
  }

  .weekday {
    padding: 5px;
    font-size: 0.9rem;
  }

  .day {
    padding: 2px;
  }

  .day-number {
    font-size: 0.9em;
  }

  :deep(.el-dialog) {
    width: 90% !important;
    margin: 10px auto !important;
  }

  :deep(.el-form-item) {
    margin-bottom: 15px;
  }
}

/* 平板屏幕 (481px - 768px) */
@media screen and (min-width: 481px) and (max-width: 768px) {
  .calendar {
    padding: 15px;
    margin: 15px;
  }

  .month-navigation h2 {
    font-size: 1.3rem;
  }

  :deep(.el-dialog) {
    width: 80% !important;
  }
}

/* 笔记本屏幕 (769px - 1024px) */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .calendar {
    padding: 20px;
    margin: 20px auto;
    max-width: 900px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .calendar {
    background: #2c3e50;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .weekday {
    background: #34495e;
    color: #ecf0f1;
  }

  .day {
    border-color: #34495e;
    color: #ecf0f1;
  }

  .day:hover {
    background: #34495e;
  }

  .has-diary {
    background: #2980b9;
    border-color: #3498db;
  }

  .is-today {
    background: #d35400;
    border-color: #e67e22;
  }

  .other-month {
    opacity: 0.3;
  }

  .diary-read {
    background: #2c3e50;
    color: #ecf0f1;
  }
}

/* 横屏模式优化 */
@media screen and (orientation: landscape) and (max-height: 600px) {
  .calendar {
    padding: 10px;
    margin: 10px;
  }

  .month-navigation {
    margin-bottom: 10px;
  }

  .weekday {
    padding: 5px;
  }

  .day {
    aspect-ratio: auto;
    height: 50px;
  }
}

/* 日记阅读模式样式 */
.diary-read {
  padding: 20px;
}

.diary-header {
  margin-bottom: 20px;
}

.diary-header h3 {
  margin: 0 0 15px 0;
  color: #409EFF;
  font-size: 1.5em;
}

.diary-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.weather-display {
  display: flex;
  align-items: center;
  gap: 5px;
}

.diary-content {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 100px;
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 20px;
}

.diary-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计补充 */
@media screen and (max-width: 480px) {
  .diary-read {
    padding: 10px;
  }

  .diary-header h3 {
    font-size: 1.2em;
  }

  .diary-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .diary-content {
    padding: 10px;
    font-size: 0.9em;
  }
}
</style> 