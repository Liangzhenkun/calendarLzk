<template>
  <div class="achievement-container">
    <!-- 成就总览卡片 -->
    <el-card class="achievement-summary">
      <div class="summary-stats">
        <div class="stat-item">
          <h3>已获得成就</h3>
          <p>{{ completedCount }}/{{ totalCount }}</p>
        </div>
        <div class="stat-item">
          <h3>当前连续打卡</h3>
          <p>{{ currentStreak }}天</p>
        </div>
        <div class="stat-item">
          <h3>本月容错剩余</h3>
          <p>{{ 5 - monthlyMisses }}天</p>
        </div>
      </div>
    </el-card>

    <!-- 成就分类标签页 -->
    <el-tabs v-model="activeCategory" class="achievement-tabs">
      <el-tab-pane label="连续打卡" name="streak">
        <div class="achievement-grid">
          <achievement-card
            v-for="achievement in streakAchievements"
            :key="achievement.id"
            :achievement="achievement"
            class="achievement-item"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="特殊成就" name="special">
        <div class="achievement-grid">
          <achievement-card
            v-for="achievement in specialAchievements"
            :key="achievement.id"
            :achievement="achievement"
            class="achievement-item"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="互动成就" name="interaction">
        <div class="achievement-grid">
          <achievement-card
            v-for="achievement in interactionAchievements"
            :key="achievement.id"
            :achievement="achievement"
            class="achievement-item"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="字数成就" name="content">
        <div class="achievement-grid">
          <achievement-card
            v-for="achievement in contentAchievements"
            :key="achievement.id"
            :achievement="achievement"
            class="achievement-item"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AchievementCard from '@/components/AchievementCard.vue'

const activeCategory = ref('streak')

// 计算成就统计
const completedCount = computed(() => {
  return [...streakAchievements.value, ...specialAchievements.value, ...interactionAchievements.value, ...contentAchievements.value]
    .filter(achievement => achievement.completed).length
})

const totalCount = computed(() => {
  return streakAchievements.value.length + specialAchievements.value.length + 
         interactionAchievements.value.length + contentAchievements.value.length
})

const currentStreak = ref(0)
const monthlyMisses = ref(0)

// 模拟数据，后续会从后端获取
const streakAchievements = ref([
  // 初心者系列
  {
    id: 1,
    name: '启程之日',
    description: '完成第一次日记记录',
    icon: 'Calendar',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 2,
    name: '初心萌动',
    description: '连续记录3天',
    icon: 'Star',
    progress: 0,
    required: 3,
    completed: false
  },
  {
    id: 3,
    name: '坚持之芽',
    description: '连续记录7天',
    icon: 'Check',
    progress: 0,
    required: 7,
    completed: false
  },
  {
    id: 4,
    name: '习惯养成',
    description: '连续记录14天（激活容错机制）',
    icon: 'Trophy',
    progress: 0,
    required: 14,
    completed: false
  },
  // 月度成就系列
  {
    id: 5,
    name: '月光守护者',
    description: '连续记录1个月',
    icon: 'Moon',
    progress: 0,
    required: 30,
    completed: false
  },
  {
    id: 6,
    name: '双月物语',
    description: '连续记录2个月',
    icon: 'MoonNight',
    progress: 0,
    required: 60,
    completed: false
  },
  {
    id: 7,
    name: '春分之约',
    description: '连续记录3个月',
    icon: 'Sunrise',
    progress: 0,
    required: 90,
    completed: false
  },
  {
    id: 8,
    name: '四月物语',
    description: '连续记录4个月',
    icon: 'Sunny',
    progress: 0,
    required: 120,
    completed: false
  },
  {
    id: 9,
    name: '五月之誓',
    description: '连续记录5个月',
    icon: 'Sunny',
    progress: 0,
    required: 150,
    completed: false
  },
  {
    id: 10,
    name: '半年之约',
    description: '连续记录6个月',
    icon: 'Sunny',
    progress: 0,
    required: 180,
    completed: false
  },
  {
    id: 11,
    name: '七月之契',
    description: '连续记录7个月',
    icon: 'Sunny',
    progress: 0,
    required: 210,
    completed: false
  },
  {
    id: 12,
    name: '八月之心',
    description: '连续记录8个月',
    icon: 'Sunny',
    progress: 0,
    required: 240,
    completed: false
  },
  {
    id: 13,
    name: '九月之旅',
    description: '连续记录9个月',
    icon: 'Sunny',
    progress: 0,
    required: 270,
    completed: false
  },
  {
    id: 14,
    name: '十月之志',
    description: '连续记录10个月',
    icon: 'Sunny',
    progress: 0,
    required: 300,
    completed: false
  },
  {
    id: 15,
    name: '十一月之约',
    description: '连续记录11个月',
    icon: 'Sunny',
    progress: 0,
    required: 330,
    completed: false
  },
  {
    id: 16,
    name: '岁末之誓',
    description: '连续记录12个月',
    icon: 'Sunny',
    progress: 0,
    required: 365,
    completed: false
  }
])

const specialAchievements = ref([
  // 季度特殊成就
  {
    id: 17,
    name: '春之物语',
    description: '完成春季（3个月）连续记录',
    icon: 'Cherry',
    progress: 0,
    required: 90,
    completed: false
  },
  {
    id: 18,
    name: '夏之轻语',
    description: '完成夏季（6个月）连续记录',
    icon: 'Sunny',
    progress: 0,
    required: 180,
    completed: false
  },
  {
    id: 19,
    name: '秋之私语',
    description: '完成秋季（9个月）连续记录',
    icon: 'Leaf',
    progress: 0,
    required: 270,
    completed: false
  },
  {
    id: 20,
    name: '冬之絮语',
    description: '完成冬季（12个月）连续记录',
    icon: 'Snowflake',
    progress: 0,
    required: 365,
    completed: false
  },
  // 里程碑特殊成就
  {
    id: 21,
    name: '时光守护者',
    description: '完成半年连续记录',
    icon: 'Timer',
    progress: 0,
    required: 180,
    completed: false
  },
  {
    id: 22,
    name: '岁月见证者',
    description: '完成一年连续记录',
    icon: 'Calendar',
    progress: 0,
    required: 365,
    completed: false
  },
  // 特殊时段成就
  {
    id: 23,
    name: '夜之诗人',
    description: '在深夜（23:00-次日5:00）完成记录',
    icon: 'Moon',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 24,
    name: '晨光笔记',
    description: '在清晨（5:00-7:00）完成记录',
    icon: 'Sunrise',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 25,
    name: '节日记事官',
    description: '在节日当天完成记录',
    icon: 'Present',
    progress: 0,
    required: 1,
    completed: false
  }
])

const interactionAchievements = ref([
  // 互动类成就
  {
    id: 26,
    name: '破茧之笔',
    description: '完成第一次日记记录',
    icon: 'EditPen',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 27,
    name: '初识之印',
    description: '完善个人资料',
    icon: 'User',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 28,
    name: '个性之彩',
    description: '自定义主题',
    icon: 'Brush',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 29,
    name: '分享之心',
    description: '分享日记',
    icon: 'Share',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 30,
    name: '时间之约',
    description: '设置提醒',
    icon: 'Bell',
    progress: 0,
    required: 1,
    completed: false
  },
  {
    id: 31,
    name: '标签达人',
    description: '使用标签功能',
    icon: 'Collection',
    progress: 0,
    required: 1,
    completed: false
  }
])

// 添加字数成就
const contentAchievements = ref([
  {
    id: 32,
    name: '初露锋芒',
    description: '累计写作100字',
    icon: 'Edit',
    progress: 0,
    required: 100,
    completed: false
  },
  {
    id: 33,
    name: '笔耕不辍',
    description: '累计写作500字',
    icon: 'Edit',
    progress: 0,
    required: 500,
    completed: false
  },
  {
    id: 34,
    name: '文思泉涌',
    description: '累计写作1000字',
    icon: 'Edit',
    progress: 0,
    required: 1000,
    completed: false
  },
  {
    id: 35,
    name: '妙笔生花',
    description: '累计写作2000字',
    icon: 'Edit',
    progress: 0,
    required: 2000,
    completed: false
  },
  {
    id: 36,
    name: '笔走龙蛇',
    description: '累计写作5000字',
    icon: 'Edit',
    progress: 0,
    required: 5000,
    completed: false
  },
  {
    id: 37,
    name: '文采斐然',
    description: '累计写作1万字',
    icon: 'Edit',
    progress: 0,
    required: 10000,
    completed: false
  },
  {
    id: 38,
    name: '著作等身',
    description: '累计写作5万字',
    icon: 'Edit',
    progress: 0,
    required: 50000,
    completed: false
  },
  {
    id: 39,
    name: '文坛巨匠',
    description: '累计写作10万字',
    icon: 'Edit',
    progress: 0,
    required: 100000,
    completed: false
  }
])
</script>

<style scoped>
.achievement-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.achievement-summary {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  margin: 0;
  font-size: 16px;
  color: #909399;
  font-weight: normal;
}

.stat-item p {
  margin: 8px 0 0;
  font-size: 24px;
  color: #303133;
  font-weight: 500;
}

.achievement-tabs {
  margin-top: 20px;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.achievement-item {
  transition: transform 0.3s ease;
}

.achievement-item:hover {
  transform: translateY(-2px);
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
}
</style> 