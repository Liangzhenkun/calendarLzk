<template>
  <div class="tasks-container">
    <!-- 惜福币展示 -->
    <el-card class="currency-card">
      <div class="currency-info">
        <el-icon color="#F7BA2A" :size="40"><GoldMedal /></el-icon>
        <div class="currency-details">
          <div class="currency-title">惜福币余额</div>
          <div class="currency-amount">
            <count-to 
              :start-val="oldCurrencyAmount" 
              :end-val="currencyAmount" 
              :duration="1000"
              separator=","
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 每日任务列表 -->
    <div class="tasks-section">
      <h2 class="section-title">
        <el-icon><Calendar /></el-icon>
        每日任务
        <span class="reset-time">（每日0点重置）</span>
      </h2>
      
      <div class="task-list">
        <task-card
          v-for="task in dailyTasks"
          :key="task.id"
          :task="task"
          @complete="handleTaskComplete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { GoldMedal, Calendar } from '@element-plus/icons-vue'
import TaskCard from '@/components/TaskCard.vue'

// 模拟数据获取和处理
const currencyAmount = ref(120)
const oldCurrencyAmount = ref(120)
const dailyTasks = ref([
  {
    id: 1,
    name: '每日签到',
    description: '登录应用完成签到',
    icon: 'Calendar',
    reward: 10,
    completed: false
  },
  {
    id: 2,
    name: '记录日记',
    description: '记录一篇今日日记',
    icon: 'EditPen',
    reward: 20,
    completed: false
  },
  {
    id: 3,
    name: '记录心情',
    description: '记录今日心情',
    icon: 'Sunny',
    reward: 5,
    completed: false
  }
])

// 任务完成处理函数
const handleTaskComplete = (taskId) => {
  const task = dailyTasks.value.find(t => t.id === taskId)
  if (task && !task.completed) {
    // 更新任务状态
    task.completed = true
    
    // 更新货币余额
    oldCurrencyAmount.value = currencyAmount.value
    currencyAmount.value += task.reward
    
    // 显示奖励通知
    showRewardNotification(task.reward)
  }
}

// 显示奖励通知
const showRewardNotification = (amount) => {
  ElNotification({
    title: '任务完成',
    message: `恭喜获得 ${amount} 惜福币奖励！`,
    type: 'success',
    duration: 3000,
    offset: 80,
    customClass: 'reward-notification'
  })
}

// 模拟从后端获取数据
onMounted(() => {
  // 这里可以添加从后端获取数据的逻辑
  // 例如: fetchUserTasks(), fetchCurrencyBalance() 等
})

// 倒计时组件（简单实现）
const CountTo = {
  props: {
    startVal: {
      type: Number,
      default: 0
    },
    endVal: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 1000
    },
    separator: {
      type: String,
      default: ','
    }
  },
  data() {
    return {
      displayValue: this.startVal
    }
  },
  watch: {
    endVal: {
      handler(value) {
        this.displayValue = this.startVal
        this.animateValue(this.startVal, value)
      }
    }
  },
  mounted() {
    this.displayValue = this.startVal
    this.animateValue(this.startVal, this.endVal)
  },
  methods: {
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.separator)
    },
    animateValue(start, end) {
      if (start === end) return
      
      const range = end - start
      const minSpeed = 50
      const duration = Math.max(this.duration, minSpeed)
      let startTime = null
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        this.displayValue = Math.floor(progress * range + start)
        
        if (progress < 1) {
          window.requestAnimationFrame(animate)
        }
      }
      
      window.requestAnimationFrame(animate)
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default(this.formatNumber(this.displayValue)) 
                              : this.formatNumber(this.displayValue)
  }
}
</script>

<style scoped>
.tasks-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.currency-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.currency-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.currency-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.currency-details {
  flex: 1;
}

.currency-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.currency-amount {
  font-size: 32px;
  font-weight: 600;
  color: #F7BA2A;
  line-height: 1.2;
  display: flex;
  align-items: center;
}

.tasks-section {
  margin-top: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
}

.reset-time {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
  margin-left: 8px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.reward-notification) {
  background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%) !important;
  border-left: 4px solid #F7BA2A !important;
}
</style> 