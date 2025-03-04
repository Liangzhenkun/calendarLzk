<template>
  <div class="achievements-container">
    <!-- 成就列表 -->
    <div class="achievements-list">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="achievement-item"
        :class="{ 'unlocked': isUnlocked(achievement.id) }"
      >
        <!-- 成就图标 -->
        <div class="achievement-icon">
          <img :src="achievement.icon_url" :alt="achievement.name">
          <div class="achievement-glow" v-if="isUnlocked(achievement.id)"></div>
        </div>
        
        <!-- 成就信息 -->
        <div class="achievement-info">
          <h3>{{ achievement.name }}</h3>
          <p>{{ achievement.description }}</p>
          <div class="achievement-progress" v-if="!isUnlocked(achievement.id)">
            <div 
              class="progress-bar"
              :style="{ width: calculateProgress(achievement) + '%' }"
            ></div>
            <span class="progress-text">
              {{ getCurrentValue(achievement) }}/{{ achievement.required_value }}
            </span>
          </div>
          <div class="unlock-date" v-else>
            解锁于: {{ formatDate(getUnlockDate(achievement.id)) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 新解锁成就弹窗 -->
    <div 
      class="achievement-popup"
      v-if="showPopup"
      @animationend="hidePopup"
    >
      <div class="popup-content">
        <div class="popup-icon">
          <img :src="newAchievement.icon_url" :alt="newAchievement.name">
        </div>
        <div class="popup-text">
          <h2>成就解锁！</h2>
          <h3>{{ newAchievement.name }}</h3>
          <p>{{ newAchievement.description }}</p>
          <div class="rewards">
            <span>+{{ newAchievement.rewards.experience }} 经验</span>
            <span>+{{ newAchievement.rewards.points }} 积分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAchievementStore } from '@/stores/achievement';
import { formatDate } from '@/utils/dateFormat';

const achievementStore = useAchievementStore();
const achievements = ref([]);
const showPopup = ref(false);
const newAchievement = ref(null);

// 获取成就列表
const fetchAchievements = async () => {
  achievements.value = await achievementStore.getAchievements();
};

// 检查成就是否解锁
const isUnlocked = (achievementId) => {
  return achievementStore.unlockedAchievements.includes(achievementId);
};

// 获取解锁日期
const getUnlockDate = (achievementId) => {
  return achievementStore.getUnlockDate(achievementId);
};

// 计算进度
const calculateProgress = (achievement) => {
  const currentValue = getCurrentValue(achievement);
  return Math.min((currentValue / achievement.required_value) * 100, 100);
};

// 获取当前值
const getCurrentValue = (achievement) => {
  return achievementStore.getAchievementProgress(achievement.id);
};

// 显示成就弹窗
const showAchievementPopup = (achievement) => {
  newAchievement.value = achievement;
  showPopup.value = true;
  // 播放音效
  playUnlockSound();
};

// 隐藏成就弹窗
const hidePopup = () => {
  showPopup.value = false;
  newAchievement.value = null;
};

// 播放解锁音效
const playUnlockSound = () => {
  const audio = new Audio('/sounds/achievement-unlock.mp3');
  audio.play();
};

// 监听新解锁的成就
achievementStore.$subscribe((mutation, state) => {
  if (mutation.type === 'unlockAchievement') {
    const achievement = achievements.value.find(
      a => a.id === mutation.payload.achievementId
    );
    if (achievement) {
      showAchievementPopup(achievement);
    }
  }
});

onMounted(() => {
  fetchAchievements();
});
</script>

<style scoped>
.achievements-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-item {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.achievement-item.unlocked {
  background: rgba(244, 208, 63, 0.1);
  border: 1px solid rgba(244, 208, 63, 0.3);
}

.achievement-icon {
  width: 64px;
  height: 64px;
  position: relative;
}

.achievement-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.unlocked .achievement-icon img {
  filter: none;
}

.achievement-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(244, 208, 63, 0.2) 0%, transparent 70%);
  animation: glow 2s infinite alternate;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  margin: 0 0 5px 0;
  color: #f4d03f;
  font-size: 1.1em;
}

.achievement-info p {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
}

.achievement-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
  margin-top: 10px;
}

.progress-bar {
  height: 100%;
  background: #f4d03f;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.5);
}

.unlock-date {
  font-size: 0.8em;
  color: rgba(244, 208, 63, 0.7);
  margin-top: 5px;
}

/* 成就弹窗 */
.achievement-popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #f4d03f;
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
  width: 80px;
  height: 80px;
}

.popup-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.popup-text h2 {
  color: #f4d03f;
  margin: 0 0 5px 0;
  font-size: 1.2em;
}

.popup-text h3 {
  color: #fff;
  margin: 0 0 10px 0;
  font-size: 1em;
}

.popup-text p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 10px 0;
  font-size: 0.9em;
}

.rewards {
  display: flex;
  gap: 10px;
}

.rewards span {
  background: rgba(244, 208, 63, 0.2);
  color: #f4d03f;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

@keyframes glow {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
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