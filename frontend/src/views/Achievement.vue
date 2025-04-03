<template>
  <div class="achievement-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else>
      <!-- 成就统计卡片 -->
      <el-card class="achievement-summary" shadow="hover">
        <div class="summary-content">
          <div class="summary-item">
            <div class="summary-number">{{ completedCount }}</div>
            <div>已完成</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">{{ achievementStore.currentStreak }}天</div>
            <div>当前连续</div>
        </div>
          <div class="summary-item">
            <div class="summary-number">{{ totalCount - completedCount }}</div>
            <div>待解锁</div>
        </div>
          <div class="summary-actions">
            <el-tooltip content="刷新成就状态" placement="top">
              <el-button 
                type="primary" 
                size="small" 
                :loading="checkingAchievements" 
                @click="checkAchievements"
              >
                刷新成就
              </el-button>
            </el-tooltip>
        </div>
      </div>
    </el-card>

      <!-- 成就分类导航 -->
      <el-tabs v-model="activeTab" class="achievement-tabs">
      <el-tab-pane label="连续打卡" name="streak">
          <div v-if="streakAchievements.length === 0" class="empty-achievement">
            <el-empty description="暂无连续打卡成就" />
          </div>
          <div v-else class="achievement-grid">
          <achievement-card
            v-for="achievement in streakAchievements"
            :key="achievement.id"
            :achievement="achievement"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="特殊成就" name="special">
          <div v-if="specialAchievements.length === 0" class="empty-achievement">
            <el-empty description="暂无特殊成就" />
          </div>
          <div v-else class="achievement-grid">
          <achievement-card
            v-for="achievement in specialAchievements"
            :key="achievement.id"
            :achievement="achievement"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="互动成就" name="interaction">
          <div v-if="interactionAchievements.length === 0" class="empty-achievement">
            <el-empty description="暂无互动成就" />
          </div>
          <div v-else class="achievement-grid">
          <achievement-card
            v-for="achievement in interactionAchievements"
            :key="achievement.id"
            :achievement="achievement"
          />
        </div>
      </el-tab-pane>

        <el-tab-pane label="内容成就" name="content">
          <div v-if="contentAchievements.length === 0" class="empty-achievement">
            <el-empty description="暂无内容成就" />
          </div>
          <div v-else class="achievement-grid">
          <achievement-card
            v-for="achievement in contentAchievements"
            :key="achievement.id"
            :achievement="achievement"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
      
      <!-- 成就详情 -->
      <div v-if="selectedAchievement" class="achievement-detail">
        <el-dialog
          v-model="showDetail"
          :title="selectedAchievement.name"
          width="30%"
        >
          <div class="achievement-detail-content">
            <p>{{ selectedAchievement.description }}</p>
            <div class="achievement-status">
              <span v-if="selectedAchievement.completed">
                已完成于 {{ formatDate(selectedAchievement.completed_at) }}
              </span>
              <span v-else>
                进度: {{ selectedAchievement.progress || 0 }}/{{ selectedAchievement.required_value }}
              </span>
            </div>
          </div>
        </el-dialog>
      </div>
      
      <!-- 成就调试信息 (开发环境下可见) -->
      <div v-if="isDevEnvironment" class="achievement-debug">
        <el-collapse>
          <el-collapse-item title="成就调试信息" name="debug">
            <div class="debug-info">
              <h4>连续打卡天数: {{ currentStreak }}</h4>
              <h4>连续成就状态:</h4>
              <pre>{{ JSON.stringify(streakAchievements, null, 2) }}</pre>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievement'
import AchievementCard from '@/components/AchievementCard.vue'
import { ElMessage, ElEmpty, ElSkeleton, ElTabs, ElTabPane, ElCard, ElButton, ElDialog, ElCollapse, ElCollapseItem } from 'element-plus'

// 成就存储
const achievementStore = useAchievementStore()

// 页面状态
const loading = ref(true)
const activeTab = ref('streak')
const showDetail = ref(false)
const selectedAchievement = ref(null)
const checkingAchievements = ref(false)
const isDevEnvironment = import.meta.env.MODE === 'development'

// 成就分类
const streakAchievements = ref([])
const specialAchievements = ref([])
const interactionAchievements = ref([])
const contentAchievements = ref([])

// 统计信息
const currentStreak = ref(0)
const monthlyMisses = ref(3) // 假设每月有3次缺勤机会

// 计算属性
const completedCount = computed(() => achievementStore.completedCount)
const totalCount = computed(() => achievementStore.totalCount)

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// 查看成就详情
const viewAchievementDetail = (achievement) => {
  selectedAchievement.value = achievement;
  showDetail.value = true;
}

// 重构获取成就数据的方法
const fetchAchievements = async () => {
  try {
    // 显示加载状态
    loading.value = true;
    
    console.log('正在获取成就数据...');
    
    // 获取所有成就列表
    await achievementStore.fetchAchievements().catch(err => {
      console.error('achievementStore.fetchAchievements调用失败:', err);
      return false;
    });
    
    console.log('获取到的成就数据:', achievementStore.achievements);
    
    if (!achievementStore.achievements || achievementStore.achievements.length === 0) {
      console.log('成就数据为空，初始化为空数组');
      // 如果没有数据，初始化各分类为空数组
      streakAchievements.value = [];
      specialAchievements.value = [];
      interactionAchievements.value = [];
      contentAchievements.value = [];
    } else {
      // 按类型分类成就
      updateAchievementCategories();
    }
    
    // 获取连续打卡天数
    currentStreak.value = achievementStore.currentStreak || 0;
    
  } catch (error) {
    console.error('获取成就数据失败:', error);
    // 确保各分类为空数组
    streakAchievements.value = [];
    specialAchievements.value = [];
    interactionAchievements.value = [];
    contentAchievements.value = [];
  } finally {
    // 隐藏加载状态
    loading.value = false;
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  console.log('成就页面挂载，开始加载数据...');
  await fetchAchievements();
  
  // 检查"启程之日"成就状态
  const firstDayAchievement = achievementStore.achievements.find(a => a.name === '启程之日' || a.id === 1);
  if (firstDayAchievement) {
    console.log('启程之日成就状态:', {
      id: firstDayAchievement.id,
      name: firstDayAchievement.name,
      completed: firstDayAchievement.completed,
      progress: firstDayAchievement.progress,
      completed_at: firstDayAchievement.completed_at
    });
    
    // 手动修正启程之日成就状态
    if (!firstDayAchievement.completed) {
      console.log('手动修正"启程之日"成就状态');
      // 在数组中查找对应的成就索引
      const achievementIndex = achievementStore.achievements.findIndex(a => a.id === 1);
      if (achievementIndex !== -1) {
        // 直接修改成就状态
        achievementStore.achievements[achievementIndex].completed = true;
        console.log('已修正"启程之日"成就状态:', achievementStore.achievements[achievementIndex]);
      }
    }
  } else {
    console.log('未找到启程之日成就');
  }
  
  // 查找并手动检查连续打卡成就
  const streakAchievements = achievementStore.achievements.filter(a => a.type === 'streak');
  console.log('连续打卡成就列表:', streakAchievements);
  
  // 获取当前连续打卡天数
  const currentStreakDays = achievementStore.currentStreak;
  console.log('当前连续打卡天数:', currentStreakDays);
  
  // 手动检查每个连续打卡成就的状态
  streakAchievements.forEach(achievement => {
    // 跳过"启程之日"成就
    if (achievement.name === '启程之日') {
      return;
    }
    
    const requiredDays = achievement.required_value || 0;
    console.log(`检查连续打卡成就: ${achievement.name}, 需要${requiredDays}天, 当前${currentStreakDays}天`);
    
    // 如果连续天数已达到或超过成就要求
    if (currentStreakDays >= requiredDays) {
      // 查找成就在数组中的索引
      const achievementIndex = achievementStore.achievements.findIndex(a => a.id === achievement.id);
      
      if (achievementIndex !== -1 && !achievementStore.achievements[achievementIndex].completed) {
        console.log(`成就 ${achievement.name} 条件已满足，但未标记为已完成，现在手动修正`);
        
        // 更新成就为已完成状态
        achievementStore.achievements[achievementIndex].completed = true;
        achievementStore.achievements[achievementIndex].progress = currentStreakDays;
        achievementStore.achievements[achievementIndex].completed_at = new Date();
        
        // 添加到已解锁列表
        if (!achievementStore.unlockedAchievements.includes(achievement.id)) {
          achievementStore.unlockedAchievements.push(achievement.id);
          achievementStore.unlockDates[achievement.id] = new Date();
        }
        
        console.log(`已修正成就 ${achievement.name} 的状态:`, achievementStore.achievements[achievementIndex]);
      }
    }
  });
  
  // 自动检查成就进度
  checkAchievements();
  
  // 启动定期检查
  achievementStore.startPeriodicCheck();
})

// 检查成就进度
const checkAchievements = async () => {
  try {
    checkingAchievements.value = true;
    console.log('开始检查成就...');
    
    // 首先重新计算连续天数（在后台进行，对用户无感）
    try {
      await achievementStore.recalculateStreak();
      console.log('连续天数重新计算完成');
    } catch (error) {
      console.error('重新计算连续天数失败，但继续检查其他成就:', error);
    }
    
    // 然后检查所有成就
    const newAchievements = await achievementStore.checkAchievementProgress();
    console.log('检查成就完成');
    
    if (newAchievements.length > 0) {
      ElMessage.success(`恭喜！您解锁了 ${newAchievements.length} 个新成就！`);
    } else {
      ElMessage.info('暂无新解锁的成就，继续加油！');
    }
    
    // 更新分类
    updateAchievementCategories();
  } catch (error) {
    console.error('检查成就进度失败:', error);
    ElMessage.error('检查成就进度失败，请稍后再试');
  } finally {
    checkingAchievements.value = false;
  }
}

// 更新成就分类逻辑
const updateAchievementCategories = () => {
  streakAchievements.value = achievementStore.achievements.filter(a => a.type === 'streak') || [];
  specialAchievements.value = achievementStore.achievements.filter(a => a.type === 'special') || [];
  interactionAchievements.value = achievementStore.achievements.filter(a => a.type === 'interaction') || [];
  contentAchievements.value = achievementStore.achievements.filter(a => a.type === 'content') || [];
  
  console.log('分类后的成就数据:', {
    streak: streakAchievements.value.length,
    special: specialAchievements.value.length,
    interaction: interactionAchievements.value.length, 
    content: contentAchievements.value.length
  });
}

// 监听成就状态变化
watch(() => achievementStore.achievements, async (newAchievements) => {
  if (newAchievements && newAchievements.length > 0) {
    // 更新分类
    updateAchievementCategories();
  }
}, { deep: true });
</script>

<style scoped>
.achievement-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  padding: 40px;
}

.achievement-summary {
  margin-bottom: 20px;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.summary-item {
  text-align: center;
  padding: 10px 20px;
}

.summary-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.summary-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.achievement-tabs {
  margin-top: 20px;
}

.empty-achievement {
  padding: 40px;
  text-align: center;
}

.achievement-detail-content {
  padding: 10px;
}

.achievement-status {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
}

.achievement-debug {
  margin-top: 30px;
  border-top: 1px dashed #eee;
  padding-top: 20px;
}

.debug-info {
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
}
</style> 