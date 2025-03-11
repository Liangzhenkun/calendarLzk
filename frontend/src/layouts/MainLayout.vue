<template>
  <div class="notebook-container">
    <!-- 书签装饰 -->
    <div class="bookmark" :class="{ 'bookmark-open': isOpen }">
      <div class="bookmark-ribbon"></div>
    </div>
    
    <!-- 金属夹子装饰 -->
    <div class="clip top-clip"></div>
    <div class="clip bottom-clip"></div>

    <!-- 日记本封面 -->
    <div class="notebook-cover" :class="{ 'cover-open': isOpen }">
      <div class="cover-front">
        <div class="cover-design">
          <h1>我的日记本</h1>
          <div class="cover-pattern"></div>
        </div>
      </div>
      <div class="cover-back"></div>
    </div>

    <!-- 日记本内页 -->
    <div class="notebook-pages" :class="{ 'pages-visible': isOpen }">
      <!-- 导航菜单 -->
      <div class="notebook-tabs">
        <div 
          class="tab"
          :class="{ active: currentRoute === '/calendar' }"
          @click="router.push('/calendar')"
        >
          日历
        </div>
        <div class="tab logout" @click="handleLogout">退出</div>
      </div>

      <!-- 内容区域 -->
      <div class="notebook-content">
        <router-view></router-view>
      </div>
      
      <!-- ICP备案信息 -->
      <div class="icp-info">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2025155032号-1</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isOpen = ref(false)

const currentRoute = computed(() => route.path)

// 在组件挂载时添加打开动画
onMounted(() => {
  setTimeout(() => {
    isOpen.value = true
  }, 300)
})

const handleLogout = async () => {
  try {
    isOpen.value = false;
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 500));
    // 调用 auth store 的登出方法
    await authStore.logout();
    ElMessage.success('已退出登录');
  } catch (error) {
    console.error('退出失败:', error);
    ElMessage.error('退出失败，请重试');
  }
};
</script>

<style scoped>
.notebook-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0e6d9;
  perspective: 2000px;
}

/* 书签样式 */
.bookmark {
  position: absolute;
  top: -20px;
  right: 100px;
  width: 40px;
  height: 120px;
  background: #e74c3c;
  transform-origin: bottom;
  transform: rotate(0deg);
  transition: transform 0.5s ease;
  z-index: 100;
}

.bookmark-open {
  transform: rotate(-10deg);
}

.bookmark-ribbon {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: #c0392b;
}

/* 金属夹子样式 */
.clip {
  position: absolute;
  width: 50px;
  height: 15px;
  background: #95a5a6;
  border-radius: 3px;
  z-index: 50;
}

.top-clip {
  top: 50px;
  left: 50px;
  transform: rotate(-45deg);
}

.bottom-clip {
  bottom: 50px;
  right: 50px;
  transform: rotate(-45deg);
}

/* 日记本封面样式 */
.notebook-cover {
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  position: relative;
  transform-style: preserve-3d;
  transform-origin: left;
  transition: transform 0.5s ease;
}

.cover-open {
  transform: rotateY(-160deg);
}

.cover-front {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #8b4513, #6d3710);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  box-shadow: 
    inset 0 0 30px rgba(0,0,0,0.4),
    2px 2px 5px rgba(0,0,0,0.2);
}

.cover-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #5d2f0d;
  border-radius: 10px;
  transform: rotateY(180deg);
  backface-visibility: hidden;
}

.cover-design {
  border: 3px solid rgba(244, 208, 63, 0.3);
  width: 80%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #f4d03f;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
}

.cover-design h1 {
  font-size: 3em;
  margin-bottom: 20px;
  font-family: "楷体", KaiTi, serif;
  letter-spacing: 4px;
}

.cover-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: 
    linear-gradient(45deg, #000 25%, transparent 25%),
    linear-gradient(-45deg, #000 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #000 75%),
    linear-gradient(-45deg, transparent 75%, #000 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

/* 日记本内页样式 */
.notebook-pages {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.pages-visible {
  opacity: 1;
}

/* 导航标签样式 */
.notebook-tabs {
  display: flex;
  padding: 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.tab {
  padding: 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.tab:hover {
  background: #e0e0e0;
}

.tab.active {
  background: #4a90e2;
  color: white;
}

.tab.logout {
  margin-left: auto;
  color: #e74c3c;
}

/* 内容区域样式 */
.notebook-content {
  padding: 20px;
  height: calc(100% - 80px);
  overflow-y: auto;
}

/* 添加纸张纹理 */
.notebook-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(to right, #f9f9f9 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

@keyframes pageFlip {
  from {
    transform: rotateY(0);
  }
  to {
    transform: rotateY(-160deg);
  }
}

/* ICP备案信息样式 */
.icp-info {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 10px;
  font-size: 12px;
}

.icp-info a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.icp-info a:hover {
  color: #333;
}
</style> 