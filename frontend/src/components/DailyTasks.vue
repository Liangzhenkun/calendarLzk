<template>
  <div class="daily-tasks-container">
    <h2 class="section-title">每日任务</h2>
    
    <!-- 任务列表 -->
    <div class="tasks-list">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="task-item"
        :class="{ 'completed': task.completed }"
      >
        <!-- 任务图标 -->
        <div class="task-icon">
          <i class="task-check" :class="{ 'checked': task.completed }"></i>
        </div>
        
        <!-- 任务信息 -->
        <div class="task-info">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          
          <!-- 任务奖励 -->
          <div class="task-rewards">
            <span class="reward">
              <i class="exp-icon"></i>
              +{{ task.experience_reward }}
            </span>
            <span class="reward">
              <i class="points-icon"></i>
              +{{ task.points_reward }}
            </span>
            <span class="reward item" v-if="task.item_reward">
              <img :src="task.item_reward.icon_url" :alt="task.item_reward.name">
            </span>
          </div>
        </div>
        
        <!-- 完成按钮 -->
        <button 
          class="complete-btn"
          :disabled="task.completed"
          @click="completeTask(task.id)"
        >
          {{ task.completed ? '已完成' : '完成' }}
        </button>
      </div>
    </div>

    <!-- 任务完成弹窗 -->
    <div 
      class="task-popup"
      v-if="showPopup"
      @animationend="hidePopup"
    >
      <div class="popup-content">
        <div class="popup-icon">
          <i class="complete-icon"></i>
        </div>
        <div class="popup-text">
          <h2>任务完成！</h2>
          <h3>{{ completedTask?.title }}</h3>
          <div class="rewards">
            <span>+{{ completedTask?.experience_reward }} 经验</span>
            <span>+{{ completedTask?.points_reward }} 积分</span>
            <span v-if="completedTask?.item_reward">
              获得道具：{{ completedTask.item_reward.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 刷新倒计时 -->
    <div class="refresh-timer">
      <p>距离任务刷新还有：{{ formatTimeRemaining }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useDailyTaskStore } from '@/stores/dailyTask';
import { storeToRefs } from 'pinia';

const taskStore = useDailyTaskStore();
const { tasks } = storeToRefs(taskStore);
const showPopup = ref(false);
const completedTask = ref(null);
const refreshTime = ref(null);

// 格式化剩余时间
const formatTimeRemaining = computed(() => {
  if (!refreshTime.value) return '';
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}小时${minutes}分钟`;
});

// 完成任务
const completeTask = async (taskId) => {
  try {
    const result = await taskStore.completeTask(taskId);
    if (result.success) {
      completedTask.value = tasks.value.find(t => t.id === taskId);
      showPopup.value = true;
      playCompleteSound();
    }
  } catch (error) {
    console.error('Error completing task:', error);
  }
};

// 隐藏弹窗
const hidePopup = () => {
  showPopup.value = false;
  completedTask.value = null;
};

// 播放完成音效
const playCompleteSound = () => {
  const audio = new Audio('/sounds/task-complete.mp3');
  audio.play();
};

// 更新倒计时
const updateRefreshTimer = () => {
  refreshTime.value = new Date();
  setTimeout(updateRefreshTimer, 60000); // 每分钟更新一次
};

onMounted(async () => {
  await taskStore.fetchDailyTasks();
  updateRefreshTimer();
});
</script>

<style scoped>
.daily-tasks-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  color: #f4d03f;
  margin-bottom: 20px;
  font-size: 1.5em;
  text-align: center;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.task-item.completed {
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.task-icon {
  width: 24px;
  height: 24px;
  position: relative;
}

.task-check {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.task-check.checked {
  background: #27ae60;
  border-color: #27ae60;
}

.task-check.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
}

.task-info {
  flex: 1;
}

.task-info h3 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 1.1em;
}

.task-info p {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
}

.task-rewards {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reward {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  color: #f4d03f;
}

.reward.item img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.complete-btn {
  background: #f4d03f;
  color: #2c3e50;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.complete-btn:disabled {
  background: #27ae60;
  cursor: default;
}

.complete-btn:not(:disabled):hover {
  background: #f5d76e;
  transform: translateY(-1px);
}

/* 任务完成弹窗 */
.task-popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(39, 174, 96, 0.9);
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 20px;
  animation: slideIn 0.5s ease forwards, slideOut 0.5s ease 4.5s forwards;
  z-index: 1000;
}

.popup-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.popup-icon {
  width: 40px;
  height: 40px;
  position: relative;
}

.complete-icon {
  width: 100%;
  height: 100%;
  border: 2px solid white;
  border-radius: 50%;
  position: relative;
}

.complete-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 8px;
  height: 16px;
  border: solid white;
  border-width: 0 3px 3px 0;
}

.popup-text h2 {
  color: white;
  margin: 0 0 5px 0;
  font-size: 1.2em;
}

.popup-text h3 {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 10px 0;
  font-size: 1em;
}

.refresh-timer {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style> 