<template>
  <el-card 
    class="achievement-card" 
    :class="{ 
      'completed': isCompleted,
      'in-progress': hasProgress && !isCompleted,
      'locked': !isCompleted && !hasProgress,
      [`type-${achievement.type}`]: true
    }"
  >
    <div class="achievement-content">
      <!-- 成就图标 -->
      <div class="achievement-icon">
        <el-icon :size="40">
          <component :is="getIconComponent" />
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
          <span v-if="isCompleted" class="completed-text">
            <el-icon><Check /></el-icon>
            已完成
            <span v-if="achievement.completed_at" class="completed-date">
              {{ formatDate(achievement.completed_at) }}
            </span>
          </span>
          <span v-else-if="hasProgress" class="in-progress-text">
            进行中 {{ currentProgress }}/{{ requiredValue }}
          </span>
          <span v-else class="locked-text">
            <el-icon><Lock /></el-icon>
            未解锁
          </span>
        </div>

        <!-- 成就奖励 -->
        <div v-if="showRewards" class="achievement-rewards">
          <span v-if="achievement.points_reward" class="reward">
            <el-icon><GoldMedal /></el-icon>
            {{ achievement.points_reward }} 积分
          </span>
          <span v-if="achievement.experience_reward" class="reward">
            <el-icon><Star /></el-icon>
            {{ achievement.experience_reward }} 经验
          </span>
        </div>
      </div>
    </div>

    <!-- 条件提示 (仅在鼠标悬停时显示) -->
    <div v-if="!isCompleted" class="achievement-hint">
      <span v-if="achievement.type === 'streak'">
        连续写日记 {{ requiredValue }} 天可解锁
      </span>
      <span v-else-if="achievement.type === 'content'">
        累计写作 {{ requiredValue }} 字可解锁
      </span>
      <span v-else-if="achievement.type === 'special'">
        特殊条件解锁
      </span>
      <span v-else-if="achievement.type === 'interaction'">
        通过特定互动解锁
      </span>
    </div>
  </el-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check, Lock, Calendar, Document, Medal, Edit, Star, GoldMedal } from '@element-plus/icons-vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
})

// 是否显示奖励
const showRewards = ref(true);

// 检查是否完成
const isCompleted = computed(() => {
  // 输出完整的成就信息用于调试
  console.log(`成就 "${props.achievement.name}" 的详细信息:`, {
    id: props.achievement.id,
    name: props.achievement.name,
    completed: props.achievement.completed,
    completed类型: typeof props.achievement.completed,
    progress: props.achievement.progress,
    current_value: props.achievement.current_value,
    required_value: props.achievement.required_value
  });
  
  // 严格检查各种可能的完成状态值
  const completedValue = props.achievement.completed;
  const result = completedValue === true || 
          completedValue === 1 || 
          completedValue === '1' || 
          completedValue === 'true';
  
  console.log(`成就 "${props.achievement.name}" 完成状态判断结果:`, result);
  return result;
})

// 当前进度值
const currentProgress = computed(() => {
  const progress = props.achievement.progress || props.achievement.current_value || 0;
  console.log(`成就 "${props.achievement.name}" 当前进度:`, progress);
  return progress;
})

// 所需值
const requiredValue = computed(() => {
  return props.achievement.required_value || props.achievement.required || 1;
})

// 检查是否有进度
const hasProgress = computed(() => {
  return currentProgress.value > 0;
})

// 计算进度百分比
const progressPercentage = computed(() => {
  if (isCompleted.value) return 100;
  return Math.min(Math.max(0, (currentProgress.value / requiredValue.value) * 100), 100);
})

// 格式化进度文本
const progressFormat = (percentage) => {
  if (isCompleted.value) return '完成';
  return `${currentProgress.value}/${requiredValue.value}`;
}

// 根据进度设置颜色
const progressColor = computed(() => {
  if (isCompleted.value) return '#67C23A';
  
  // 根据成就类型设置不同的进行中颜色
  if (hasProgress.value) {
    switch (props.achievement.type) {
      case 'streak': return '#409EFF'; // 蓝色
      case 'special': return '#E6A23C'; // 橙色
      case 'interaction': return '#9254DE'; // 紫色
      case 'content': return '#F56C6C'; // 红色
      default: return '#409EFF';
    }
  }
  return '#909399';
})

// 获取图标组件
const getIconComponent = computed(() => {
  const iconName = props.achievement.icon_url || props.achievement.icon;
  
  // 常用图标映射
  const iconMap = {
    'Calendar': Calendar,
    'Document': Document,
    'Medal': Medal,
    'Edit': Edit,
    'Star': Star
  };
  
  // 根据成就类型设置默认图标
  if (!iconMap[iconName]) {
    switch (props.achievement.type) {
      case 'streak': return Calendar;
      case 'special': return Star;
      case 'interaction': return Medal;
      case 'content': return Document;
      default: return Medal;
    }
  }
  
  return iconMap[iconName] || Medal;
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 调试信息
onMounted(() => {
  console.log('成就卡片挂载:', props.achievement.name);
  console.log('完整成就数据:', props.achievement);
  console.log('完成状态:', isCompleted.value);
  console.log('进度:', currentProgress.value);
  console.log('所需值:', requiredValue.value);
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
  position: relative;
  overflow: hidden;
}

.achievement-card.completed {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.2), rgba(103, 194, 58, 0.1));
  backdrop-filter: blur(15px);
  border: 1px solid rgba(103, 194, 58, 0.2);
  box-shadow: 0 4px 16px 0 rgba(103, 194, 58, 0.15);
}

.achievement-card.in-progress {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.achievement-card.locked {
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(8px);
}

/* 按成就类型设置不同边框颜色 */
.achievement-card.type-streak.completed {
  border-left: 3px solid #409EFF;
}

.achievement-card.type-special.completed {
  border-left: 3px solid #E6A23C;
}

.achievement-card.type-interaction.completed {
  border-left: 3px solid #9254DE;
}

.achievement-card.type-content.completed {
  border-left: 3px solid #F56C6C;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.achievement-card.completed:hover {
  box-shadow: 0 6px 20px 0 rgba(103, 194, 58, 0.2);
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
  background: rgba(103, 194, 58, 0.15);
  color: #67C23A;
  box-shadow: 0 2px 10px rgba(103, 194, 58, 0.2);
}

.achievement-card.locked .achievement-icon {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

/* 按成就类型设置不同图标背景 */
.achievement-card.type-streak .achievement-icon {
  background: rgba(64, 158, 255, 0.15);
  color: #409EFF;
}

.achievement-card.type-special .achievement-icon {
  background: rgba(230, 162, 60, 0.15);
  color: #E6A23C;
}

.achievement-card.type-interaction .achievement-icon {
  background: rgba(146, 84, 222, 0.15);
  color: #9254DE;
}

.achievement-card.type-content .achievement-icon {
  background: rgba(245, 108, 108, 0.15);
  color: #F56C6C;
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

.achievement-card.completed .achievement-name {
  color: #67C23A;
}

/* 按成就类型设置不同标题颜色 */
.achievement-card.type-streak .achievement-name {
  color: #409EFF;
}

.achievement-card.type-special .achievement-name {
  color: #E6A23C;
}

.achievement-card.type-interaction .achievement-name {
  color: #9254DE;
}

.achievement-card.type-content .achievement-name {
  color: #F56C6C;
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
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.completed-date {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.in-progress-text {
  color: #409EFF;
}

.locked-text {
  color: #909399;
}

/* 新增：成就奖励样式 */
.achievement-rewards {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.reward {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 新增：成就提示样式 */
.achievement-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px;
  font-size: 12px;
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  opacity: 0;
}

.achievement-card:hover .achievement-hint {
  transform: translateY(0);
  opacity: 1;
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