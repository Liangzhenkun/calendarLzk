<template>
  <div 
    class="calendar-container"
    v-touch:swipe.left="nextMonth"
    v-touch:swipe.right="previousMonth"
    v-touch:pinch="handlePinch"
    v-touch:longtap="handleLongTap"
    v-touch:tap="handleTap"
  >
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay ios-glass">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <div class="calendar" :class="{ 
      'month-changing': isMonthChanging,
      'is-mobile': isMobile 
    }">
      <!-- 日历头部 -->
    <div class="calendar-header">
      <div class="month-navigation">
          <el-button 
            class="nav-button ios-button" 
            text 
            @click="previousMonth"
            :disabled="isMonthChanging"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <transition name="month-title" mode="out-in">
            <h2 class="month-title" :key="currentYear + '-' + currentMonth">
              {{ currentYear }}年{{ currentMonth + 1 }}月
            </h2>
          </transition>
          <el-button 
            class="nav-button ios-button" 
            text 
            @click="nextMonth"
            :disabled="isMonthChanging"
          >
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="debug-tools" v-if="showDebugTools">
          <el-button size="small" @click="checkAuthStatus">检查认证状态</el-button>
          <el-button size="small" @click="testBackendConnection">测试后端连接</el-button>
      </div>
    </div>

      <!-- 日历主体 -->
    <div class="calendar-body">
        <!-- 星期栏 -->
      <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">
            {{ isMobile ? day.charAt(0) : day }}
          </div>
      </div>
      
        <!-- 日期网格 -->
        <transition-group 
          name="calendar-days" 
          tag="div" 
          class="days"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @leave="onLeave"
        >
          <div
            v-for="({ date, isCurrentMonth, hasDiary }, index) in calendarDays"
          :key="date.toISOString()"
          class="day"
          :class="{
            'other-month': !isCurrentMonth,
            'has-diary': hasDiary,
              'is-today': isToday(date)
          }"
            :data-index="index"
          @click="openDiaryDialog({ date, hasDiary })"
        >
          <span class="day-number">{{ date.getDate() }}</span>
            <transition name="diary-dot">
              <div v-if="hasDiary" class="diary-indicator"></div>
            </transition>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 日记对话框 -->
    <el-dialog
      v-model="diaryDialogVisible"
      :title="dialogTitle"
      width="90%"
      custom-class="diary-dialog ios-dialog"
      :close-on-click-modal="false"
      destroy-on-close
      ref="dialogLazyLoad"
    >
      <div class="diary-form ios-form">
        <el-form :model="diaryForm" label-width="80px">
          <el-form-item label="标题">
            <el-input
              v-model="diaryForm.title"
              placeholder="请输入日记标题..."
              class="ios-input"
              prefix-icon="Edit"
            />
          </el-form-item>
          
          <el-form-item label="心情">
            <div class="mood-selector">
              <el-rate
                v-model="diaryForm.mood"
                :colors="moodColors"
                :texts="moodTexts"
                show-text
                class="ios-rate"
              >
                <template #icon="{ item }">
                  <span class="mood-emoji">{{ moodEmoji[item.value - 1] }}</span>
                </template>
              </el-rate>
            </div>
          </el-form-item>
          
          <el-form-item label="天气">
            <el-select 
              v-model="diaryForm.weather" 
              placeholder="选择天气"
              class="ios-select"
            >
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
          <div class="metrics-section">
            <el-divider>个性化指标记录</el-divider>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="睡眠质量">
                  <el-rate
                    v-model="diaryForm.metrics.sleepQuality"
                    :max="10"
                    :colors="metricColors"
                    :texts="sleepQualityTexts"
                    show-text
                    class="ios-rate"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="压力水平">
                  <el-rate
                    v-model="diaryForm.metrics.stressLevel"
                    :max="10"
                    :colors="metricColors.slice().reverse()"
                    :texts="stressLevelTexts"
                    show-text
                    class="ios-rate"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="工作效率">
                  <el-rate
                    v-model="diaryForm.metrics.productivity"
                    :max="10"
                    :colors="metricColors"
                    :texts="productivityTexts"
                    show-text
                    class="ios-rate"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <el-form-item label="内容">
            <el-input
              v-model="diaryForm.content"
              type="textarea"
              :rows="6"
              placeholder="写下今天的故事..."
              class="ios-input diary-content"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="ios-button" @click="diaryDialogVisible = false">取消</el-button>
          <el-button type="primary" class="ios-button" @click="saveDiary">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 阅读模式对话框 -->
    <el-dialog
      v-model="readDialogVisible"
      :title="dialogTitle"
      width="90%"
      custom-class="diary-dialog ios-dialog"
      :close-on-click-modal="false"
    >
      <div class="diary-read">
        <div class="diary-header">
          <h3>{{ diaryForm.title }}</h3>
          <div class="diary-meta">
            <div class="mood-display">
              <el-rate
                v-model="diaryForm.mood"
                :colors="moodColors"
                :texts="moodTexts"
                show-text
                disabled
                class="ios-rate"
              >
                <template #icon="{ item }">
                  <span class="mood-emoji">{{ moodEmoji[item.value - 1] }}</span>
                </template>
              </el-rate>
            </div>
            <div class="weather-display">
              <i :class="getWeatherIcon(diaryForm.weather)"></i>
              {{ getWeatherLabel(diaryForm.weather) }}
            </div>
          </div>
        </div>
        <div class="diary-content">
          {{ diaryForm.content }}
        </div>
        <div class="diary-metrics">
          <el-divider>个性化指标</el-divider>
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="metric-item">
                <span class="metric-label">睡眠质量</span>
                <el-rate
                  v-model="diaryForm.metrics.sleepQuality"
                  :max="10"
                  :colors="metricColors"
                  :texts="sleepQualityTexts"
                  show-text
                  disabled
                  class="ios-rate"
                />
              </div>
            </el-col>
            <el-col :span="24">
              <div class="metric-item">
                <span class="metric-label">压力水平</span>
                <el-rate
                  v-model="diaryForm.metrics.stressLevel"
                  :max="10"
                  :colors="metricColors.slice().reverse()"
                  :texts="stressLevelTexts"
                  show-text
                  disabled
                  class="ios-rate"
                />
              </div>
            </el-col>
            <el-col :span="24">
              <div class="metric-item">
                <span class="metric-label">工作效率</span>
                <el-rate
                  v-model="diaryForm.metrics.productivity"
                  :max="10"
                  :colors="metricColors"
                  :texts="productivityTexts"
                  show-text
                  disabled
                  class="ios-rate"
                />
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="diary-actions">
          <el-button type="primary" class="ios-button" @click="switchToEditMode">编辑日记</el-button>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="ios-button" type="danger" @click="confirmDeleteDiary">删除</el-button>
          <el-button class="ios-button" @click="editDiary">编辑</el-button>
          <el-button class="ios-button" @click="readDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="确认删除"
      width="300px"
      custom-class="delete-confirm-dialog ios-dialog"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="delete-confirm-content">
        <p>确定要删除这篇日记吗？此操作不可恢复。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="ios-button" @click="deleteConfirmVisible = false">取消</el-button>
          <el-button class="ios-button" type="danger" @click="deleteDiary">确定删除</el-button>
        </span>
      </template>
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
          <div class="metrics-section">
            <el-divider>个性化指标记录</el-divider>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="睡眠质量">
                  <el-rate
                    v-model="diaryForm.metrics.sleepQuality"
                    :max="10"
                    :colors="metricColors"
                    :texts="sleepQualityTexts"
                    show-text
                  ></el-rate>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="压力水平">
                  <el-rate
                    v-model="diaryForm.metrics.stressLevel"
                    :max="10"
                    :colors="metricColors.slice().reverse()"
                    :texts="stressLevelTexts"
                    show-text
                  ></el-rate>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="工作效率">
                  <el-rate
                    v-model="diaryForm.metrics.productivity"
                    :max="10"
                    :colors="metricColors"
                    :texts="productivityTexts"
                    show-text
                  ></el-rate>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
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
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { useDiaryStore } from '@/stores/diary';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { t } = useI18n();
const diaryStore = useDiaryStore();
const authStore = useAuthStore();
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const currentDate = ref(new Date());
const diaryDialogVisible = ref(false);
const readDialogVisible = ref(false);
const editDialogVisible = ref(false);
const selectedDate = ref(null);
const showDebugTools = ref(true); // 开发环境显示调试工具

// 个性化指标配置
const metricColors = ['#F56C6C', '#E6A23C', '#909399', '#67C23A', '#409EFF'];
const sleepQualityTexts = [
  '非常差', '很差', '较差', '一般', '还行',
  '不错', '良好', '优质', '很好', '极佳'
];
const stressLevelTexts = [
  '极度紧张', '很大压力', '较大压力', '有些压力', '一般压力',
  '较为轻松', '比较轻松', '很轻松', '基本无压', '完全无压'
];
const productivityTexts = [
  '效率极低', '效率很低', '效率较低', '效率一般', '效率还行',
  '效率不错', '效率良好', '效率优秀', '效率极高', '效率满分'
];

// 心情相关配置
const moodColors = ['#99A9BF', '#FFB61E', '#FF9900', '#FF6666', '#E60012']
const moodTexts = ['失落', '平静', '还好', '开心', '超棒']
const moodEmoji = ['😢', '😐', '🙂', '😄', '😍']

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
    sleepQuality: 5,
    stressLevel: 5,
    productivity: 5
  }
});

// 计算属性
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const dialogTitle = computed(() => {
  const date = selectedDate.value
  if (!date) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日的日记`
})

// 添加性能优化相关的代码
const isDialogMounted = ref(false)
const dialogLazyLoad = ref(null)

// 优化计算属性的性能
const calendarDays = computed(() => {
  // 使用 WeakMap 缓存日期计算结果
  const cache = new WeakMap()
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  if (cache.has(currentDate.value)) {
    return cache.get(currentDate.value)
  }
  
  const days = calculateDays(year, month)
  cache.set(currentDate.value, days)
  return days
})

// 分离日期计算逻辑
const calculateDays = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  const startDay = new Date(firstDay)
  startDay.setDate(startDay.getDate() - startDay.getDay())
  
  while (days.length < 42) {
    const date = new Date(startDay)
    // 使用一致的日期格式化方法检查是否有日记
    const hasDiary = diaryStore.hasDiaryOnDate(date)
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      hasDiary
    })
    startDay.setDate(startDay.getDate() + 1)
  }
  
  return days;
};

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
  
  // 确保日期格式正确 - 使用本地时间
  const isoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // 初始化默认的日记表单数据
  const defaultDiaryForm = {
    date: isoDate,
    title: `${formattedDate}的日记`,
    mood: 3,
    weather: 'sunny',
    content: '',
    metrics: {
      sleepQuality: 5,
      stressLevel: 5,
      productivity: 5
    }
  };
  
  if (hasDiary) {
    try {
      // 如果有日记，先获取内容并显示阅读模式
      const diary = await diaryStore.getDiaryByDate(date);
      if (diary) {
        // 确保 metrics 对象存在
        const metrics = diary.metrics || defaultDiaryForm.metrics;
        
        diaryForm.value = {
          date: isoDate,
          title: diary.title || defaultDiaryForm.title,
          mood: diary.mood || defaultDiaryForm.mood,
          weather: diary.weather || defaultDiaryForm.weather,
          content: diary.content || '',
          metrics: {
            sleepQuality: metrics.sleepQuality || defaultDiaryForm.metrics.sleepQuality,
            stressLevel: metrics.stressLevel || defaultDiaryForm.metrics.stressLevel,
            productivity: metrics.productivity || defaultDiaryForm.metrics.productivity
          }
        };
        readDialogVisible.value = true;
      }
    } catch (error) {
      console.error('获取日记失败:', error);
      ElMessage.error('获取日记失败');
      // 如果获取失败，使用默认值
      diaryForm.value = defaultDiaryForm;
      editDialogVisible.value = true;
    }
  } else {
    // 如果没有日记，使用默认值
    diaryForm.value = defaultDiaryForm;
    editDialogVisible.value = true;
  }
};

// 保存日记
const saveDiary = async () => {
  saving.value = true
  try {
    // 确保使用正确的日期格式 - 使用本地时间
    const date = new Date(diaryForm.value.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    await diaryStore.saveDiary({
      ...diaryForm.value,
      date: formattedDate
    });
    
    editDialogVisible.value = false;
    ElMessage.success('日记保存成功');
    
    // 刷新当月数据
    await fetchMonthDiaries();
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '保存失败: ' + error.message,
      customClass: 'ios-message'
    })
  } finally {
    saving.value = false
  }
}

// 日历导航方法
const previousMonth = async () => {
  if (isMonthChanging.value) return
  isMonthChanging.value = true
  monthTransition.value = 'prev'
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1)
  
  try {
    await fetchMonthDiaries()
  } finally {
    setTimeout(() => {
      isMonthChanging.value = false
    }, 500)
  }
}

const nextMonth = async () => {
  if (isMonthChanging.value) return
  isMonthChanging.value = true
  monthTransition.value = 'next'
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1)
  
  try {
    await fetchMonthDiaries()
  } finally {
    setTimeout(() => {
      isMonthChanging.value = false
    }, 500)
  }
}

// 判断是否是今天
const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// 获取当月日记数据
const fetchMonthDiaries = async () => {
  console.log('开始获取当月日记数据:', currentDate.value);
  try {
    await diaryStore.fetchMonthDiaries(currentDate.value);
    console.log('日记数据获取成功:', diaryStore.diaries);
  } catch (error) {
    console.error('获取日记数据失败:', error);
    ElMessage.error('获取日记数据失败');
  }
};

// 组件挂载时初始化数据
onMounted(async () => {
  console.log('Calendar组件挂载');
  try {
    await fetchMonthDiaries();
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('初始化数据失败');
  }
});

// 获取指标标签
const getMetricLabel = (key) => {
  const labels = {
    sleepQuality: '睡眠质量',
    stressLevel: '压力水平',
    productivity: '工作效率'
  };
  return labels[key] || key;
};

// 动画相关
const monthTransition = ref('next');

// 月份切换动画处理方法
const onBeforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = monthTransition.value === 'next' 
    ? 'translateX(30px)' 
    : 'translateX(-30px)';
};

const onEnter = (el, done) => {
  const delay = el.dataset.index * 50;
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease-out';
    el.style.opacity = 1;
    el.style.transform = 'translateX(0)';
  }, delay);
};

const onLeave = (el, done) => {
  const delay = el.dataset.index * 50;
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease-out';
    el.style.opacity = 0;
    el.style.transform = monthTransition.value === 'next' 
      ? 'translateX(-30px)' 
      : 'translateX(30px)';
  }, delay);
};

// 手势处理
const handlePinch = (e) => {
  ElMessage({
    message: '缩放功能即将推出',
    type: 'info',
    customClass: 'ios-message ios-message-info',
    duration: 2000
  });
};

const handleLongTap = (e) => {
  // 添加触觉反馈（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  const date = new Date();
  openDiaryDialog({ 
    date, 
    hasDiary: diaryStore.hasDiaryOnDate(date) 
  });
};

const handleTap = (e) => {
  if (e.target.classList.contains('day')) {
    // 添加水波纹效果
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    e.target.appendChild(ripple);
    
    // 计算水波纹位置
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // 动画结束后移除水波纹
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    e.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.target.style.transform = '';
    }, 200);
  }
};

// 移动设备检测
const isMobile = ref(window.innerWidth <= 768);
const isMonthChanging = ref(false);

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
});

// 优化性能的保存状态
const saving = ref(false);

// 异步加载月份数据
const loading = ref(false);

// 删除确认对话框的可见性
const deleteConfirmVisible = ref(false);

// 确认删除日记
const confirmDeleteDiary = () => {
  deleteConfirmVisible.value = true;
};

// 删除日记
const deleteDiary = async () => {
  try {
    console.log('准备删除日记，日期:', diaryForm.value.date);
    await diaryStore.deleteDiary(diaryForm.value.date);
    deleteConfirmVisible.value = false;
    readDialogVisible.value = false;
    ElMessage.success('日记删除成功');
    // 刷新当月数据
    await fetchMonthDiaries();
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message);
  }
};

// 编辑日记
const editDiary = () => {
  readDialogVisible.value = false;
  diaryDialogVisible.value = true;
};

// 调试工具方法
const checkAuthStatus = () => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    ElMessage.success(`Token 存在: ${token.substring(0, 15)}...`);
  } else {
    ElMessage.error('未找到 Token，请重新登录');
  }
};

const testBackendConnection = async () => {
  try {
    // 使用环境变量中的API URL，移除重复的/api前缀
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${apiUrl}/health`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`
      }
    });
    ElMessage.success(`后端连接成功: ${JSON.stringify(response.data)}`);
  } catch (error) {
    ElMessage.error(`后端连接失败: ${error.message}`);
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/ios-mixins.scss';

.calendar-container {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--ios-radius-lg);
  @include ios-shadow('lg');
  backdrop-filter: var(--ios-blur-md);
  -webkit-backdrop-filter: var(--ios-blur-md);
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.calendar-header {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  @include ios-glass;
  border-top-left-radius: var(--ios-radius-lg);
  border-top-right-radius: var(--ios-radius-lg);
  position: sticky;
  top: 0;
  z-index: var(--ios-z-index-header);
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  
  .nav-button {
    color: var(--ios-primary);
    transition: all var(--ios-transition-fast);
    
    &:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.5;
    }
  }
}

.month-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ios-primary);
  margin: 0;
  font-family: var(--ios-font-family);
  transition: all var(--ios-transition-normal);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 12px 0;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--ios-border);
  position: sticky;
  top: 80px;
  z-index: var(--ios-z-index-header);
  backdrop-filter: var(--ios-blur-sm);
  -webkit-backdrop-filter: var(--ios-blur-sm);
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: var(--ios-text-secondary);
  font-family: var(--ios-font-family);
  padding: 10px;
  font-size: 0.9rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(0, 0, 0, 0.04);
  padding: 1px;
}

.day {
  aspect-ratio: 1;
  padding: 5px;
  border: 1px solid var(--ios-border);
  border-radius: var(--ios-radius-sm);
  cursor: pointer;
  transition: all var(--ios-transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-1px);
    @include ios-shadow('sm');
    background: rgba(255, 255, 255, 0.9);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.other-month {
  opacity: 0.5;
}

  &.has-diary {
    background: rgba(var(--ios-primary-rgb), 0.1);
    border-color: var(--ios-primary);
    
    .diary-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--ios-primary);
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      animation: ios-scale-in var(--ios-transition-fast);
    }
  }
  
  &.is-today {
    background: rgba(var(--ios-secondary-rgb), 0.1);
    border-color: var(--ios-secondary);
    font-weight: 600;
    
    .day-number {
      color: var(--ios-secondary);
    }
  }
}

.day-number {
  font-size: 1.1em;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--ios-text-primary);
  font-family: var(--ios-font-family);
}

/* 对话框样式 */
.diary-dialog {
  .el-dialog__header {
    padding: var(--ios-spacing-lg);
    margin: 0;
    border-bottom: 1px solid var(--ios-border);
    @include ios-glass;
    
    .el-dialog__title {
      font-weight: 600;
      color: var(--ios-text-primary);
      font-family: var(--ios-font-family);
    }
  }
  
  .el-dialog__body {
    padding: var(--ios-spacing-lg);
  }
  
  .el-dialog__footer {
    padding: var(--ios-spacing-md) var(--ios-spacing-lg);
    border-top: 1px solid var(--ios-border);
    @include ios-glass;
  }
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
  .calendar-container {
    padding: 10px;
    margin: 10px;
  }

  .month-navigation {
    padding: 0 10px;
  }

  .month-title {
    font-size: 1.2rem;
  }

  .weekday {
    padding: 5px;
    font-size: 0.8rem;
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

/* 平板屏幕 */
@media screen and (min-width: 481px) and (max-width: 768px) {
  .calendar-container {
    padding: 15px;
    margin: 15px;
  }

  .month-title {
    font-size: 1.3rem;
  }

  :deep(.el-dialog) {
    width: 80% !important;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .calendar-container {
    background: rgba(44, 62, 80, 0.8);
  }

  .calendar-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .weekday {
    color: rgba(255, 255, 255, 0.7);
  }

  .day {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    &.has-diary {
      background: rgba(var(--ios-primary-rgb), 0.2);
    }
    
    &.is-today {
      background: rgba(var(--ios-secondary-rgb), 0.2);
    }
    
    .day-number {
      color: #ffffff;
    }
  }
}

/* 动画效果 */
.month-title-enter-active,
.month-title-leave-active {
  transition: all var(--ios-transition-normal);
}

.month-title-enter-from,
.month-title-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 日历网格切换动画 */
.calendar-days-enter-active,
.calendar-days-leave-active {
  transition: all 0.3s ease-out;
}

.calendar-days-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.calendar-days-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.calendar-days-move {
  transition: transform 0.3s ease-out;
}

/* 单个日期格子的动画 */
.day {
  transition: all 0.3s ease-out;
  transform-origin: center;
  
  &.calendar-days-leave-active {
    position: absolute;
  }
  
  &.calendar-days-move {
    transition: all 0.3s ease-out;
  }
}

.diary-dot-enter-active,
.diary-dot-leave-active {
  transition: all var(--ios-transition-fast);
}

.diary-dot-enter-from,
.diary-dot-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* 日记对话框样式 */
.diary-dialog {
.diary-form {
    padding: var(--ios-spacing-md);
  }
  
  .mood-selector {
    display: flex;
    align-items: center;
    gap: var(--ios-spacing-md);
  }
  
  .mood-emoji {
    font-size: 1.5rem;
  }
  
  .metrics-section {
    background: rgba(0, 0, 0, 0.02);
    border-radius: var(--ios-radius-md);
    padding: var(--ios-spacing-md);
    margin: var(--ios-spacing-md) 0;
  }
  
  .diary-content {
    font-family: var(--ios-font-family);
    line-height: 1.6;
    
    &::placeholder {
      color: var(--ios-text-secondary);
    }
  }
}

/* 阅读模式样式 */
.diary-read {
  padding: var(--ios-spacing-lg);
  
  .diary-header {
    margin-bottom: var(--ios-spacing-lg);
    
    h3 {
      margin: 0 0 var(--ios-spacing-md) 0;
      color: var(--ios-primary);
      font-size: 1.5rem;
      font-weight: 600;
      font-family: var(--ios-font-family);
    }
  }
  
  .diary-meta {
    display: flex;
    align-items: center;
    gap: var(--ios-spacing-lg);
    margin-bottom: var(--ios-spacing-md);
  }
  
  .weather-display {
    display: flex;
    align-items: center;
    gap: var(--ios-spacing-sm);
    color: var(--ios-text-secondary);
    font-size: 0.9rem;
    
    i {
      font-size: 1.2rem;
    }
  }
  
  .diary-content {
    padding: var(--ios-spacing-lg);
    background: rgba(0, 0, 0, 0.02);
    border-radius: var(--ios-radius-md);
    min-height: 100px;
    white-space: pre-wrap;
    line-height: 1.6;
    margin-bottom: var(--ios-spacing-lg);
    font-family: var(--ios-font-family);
    color: var(--ios-text-primary);
  }
  
  .diary-metrics {
    margin-top: var(--ios-spacing-lg);
    
    .metric-item {
      display: flex;
      flex-direction: column;
      gap: var(--ios-spacing-sm);
      margin-bottom: var(--ios-spacing-md);
      
      .metric-label {
        color: var(--ios-text-secondary);
        font-size: 0.9rem;
      }
    }
  }
  
  .diary-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--ios-spacing-md);
    margin-top: var(--ios-spacing-lg);
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .diary-dialog {
    .metrics-section {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .diary-content {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
  
  .diary-read {
    .diary-header h3 {
      color: var(--ios-secondary);
    }
    
    .diary-content {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
    }
    
    .diary-meta,
    .metric-label {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
  .diary-dialog {
    .diary-form {
      padding: var(--ios-spacing-sm);
    }
    
    .metrics-section {
      padding: var(--ios-spacing-sm);
    }
  }
  
  .diary-read {
    padding: var(--ios-spacing-md);
    
    .diary-header h3 {
      font-size: 1.2rem;
    }
    
    .diary-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--ios-spacing-sm);
    }
    
    .diary-content {
      padding: var(--ios-spacing-md);
      font-size: 0.9rem;
    }
  }
}

/* 加载动画 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: var(--ios-z-index-overlay);
  animation: ios-fade-in var(--ios-transition-fast);
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--ios-primary);
    border-radius: 50%;
    border-top-color: transparent;
    animation: ios-spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  span {
    color: var(--ios-text-secondary);
    font-family: var(--ios-font-family);
    font-size: 14px;
  }
}

/* 水波纹效果 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(var(--ios-primary-rgb), 0.2);
  transform: scale(0);
  animation: ios-ripple 0.6s linear;
  pointer-events: none;
}

/* 移动端优化 */
@media screen and (max-width: 480px) {
  .diary-dialog {
    &.el-dialog {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0 !important;
      max-height: 90vh;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      transform: translateY(100%);
      transition: transform var(--ios-transition-normal);
      
      &.dialog-fade-enter-active,
      &.dialog-fade-leave-active {
        transition: transform var(--ios-transition-normal);
      }
      
      &.dialog-fade-enter-to,
      &.dialog-fade-leave-from {
        transform: translateY(0);
      }
      
      .el-dialog__header {
        padding: 16px;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 4px;
          background: var(--ios-border);
          border-radius: 2px;
        }
      }
      
      .el-dialog__body {
        max-height: calc(90vh - 120px);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  }
}

/* 动画关键帧 */
@keyframes ios-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ios-ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes ios-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.8);
    
    .loading-spinner {
      border-color: var(--ios-secondary);
      border-top-color: transparent;
    }
    
    span {
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .ripple {
    background: rgba(255, 255, 255, 0.2);
  }
}

.delete-confirm-dialog {
  .delete-confirm-content {
    text-align: center;
    padding: 20px 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 