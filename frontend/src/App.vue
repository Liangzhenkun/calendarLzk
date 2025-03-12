<template>
  <el-config-provider :locale="zhCn">
    <div class="app">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <IcpInfo />
    </div>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import IcpInfo from '@/components/IcpInfo.vue'
</script>

<style>
.app {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  padding-bottom: 40px; /* 为 ICP 信息预留空间 */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 