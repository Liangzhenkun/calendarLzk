<template>
  <el-card class="task-card" :class="{ 'completed': task.completed }">
    <div class="task-content">
      <!-- 任务图标 -->
      <div class="task-icon">
        <el-icon :size="32">
          <component :is="task.icon" />
        </el-icon>
      </div>

      <!-- 任务信息 -->
      <div class="task-info">
        <h3 class="task-name">{{ task.name }}</h3>
        <p class="task-description">{{ task.description }}</p>
      </div>

      <!-- 任务奖励 -->
      <div class="task-reward">
        <span class="reward-amount">
          <el-icon><GoldMedal /></el-icon>
          {{ task.reward }}
        </span>
        <el-button 
          :type="task.completed ? 'success' : 'primary'"
          :disabled="task.completed"
          size="small"
          @click="completeTask"
        >
          {{ task.completed ? '已完成' : '完成' }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { GoldMedal } from '@element-plus/icons-vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])

const completeTask = () => {
  emit('complete', props.task.id)
}
</script>

<style scoped>
.task-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.task-card.completed {
  opacity: 0.7;
  background: #f5f7fa;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.task-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.task-card.completed .task-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.task-info {
  flex: 1;
}

.task-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.task-description {
  margin: 4px 0 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.task-reward {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.reward-amount {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #F7BA2A;
  font-weight: 500;
}
</style> 