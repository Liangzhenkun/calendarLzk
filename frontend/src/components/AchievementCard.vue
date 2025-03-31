<template>
  <el-card 
    class="achievement-card" 
    :class="{ 
      'completed': achievement.completed,
      'locked': !achievement.completed && achievement.progress === 0
    }"
  >
    <div class="achievement-content">
      <!-- 成就图标 -->
      <div class="achievement-icon">
        <el-icon :size="40">
          <component :is="achievement.icon" />
        </el-icon>
      </div>

      <!-- 成就信息 -->
      <div class="achievement-info">
        <h3 class="achievement-name">{{ achievement.name }}</h3>
        <p class="achievement-description">{{ achievement.description }}</p>
        
        <!-- 进度条 -->
        <div class="achievement-progress">
          <el-progress 
            :percentage="progressPercentage"
            :format="progressFormat"
            :stroke-width="8"
            :show-text="true"
            :color="progressColor"
          />
        </div>

        <!-- 成就状态 -->
        <div class="achievement-status">
          <span v-if="achievement.completed" class="completed-text">
            <el-icon><Check /></el-icon>
            已完成
          </span>
          <span v-else-if="achievement.progress > 0" class="in-progress-text">
            进行中 {{ achievement.progress }}/{{ achievement.required }}
          </span>
          <span v-else class="locked-text">
            <el-icon><Lock /></el-icon>
            未解锁
          </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Lock } from '@element-plus/icons-vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
})

const progressPercentage = computed(() => {
  return Math.min((props.achievement.progress / props.achievement.required) * 100, 100)
})

const progressFormat = (percentage) => {
  return `${props.achievement.progress}/${props.achievement.required}`
}

const progressColor = computed(() => {
  if (props.achievement.completed) return '#67C23A'
  if (props.achievement.progress > 0) return '#409EFF'
  return '#909399'
})
</script>

<style scoped>
.achievement-card {
  height: 100%;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.achievement-content {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.achievement-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.achievement-card.completed .achievement-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.achievement-card.locked .achievement-icon {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement-name {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.achievement-description {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.achievement-progress {
  margin-top: 8px;
}

.achievement-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  margin-top: 8px;
}

.completed-text {
  color: #67C23A;
}

.in-progress-text {
  color: #409EFF;
}

.locked-text {
  color: #909399;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(144, 147, 153, 0.1);
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-progress__text) {
  font-size: 13px;
  color: #909399;
}
</style> 