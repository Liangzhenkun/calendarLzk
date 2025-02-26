<template>
  <el-container class="layout-container">
    <el-header>
      <el-menu
        :router="true"
        mode="horizontal"
        :ellipsis="false"
      >
        <el-menu-item index="/calendar">日历</el-menu-item>
        <el-menu-item index="/diary">日记</el-menu-item>
        <div class="flex-grow" />
        <el-menu-item @click="handleLogout">退出</el-menu-item>
      </el-menu>
    </el-header>
    
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.flex-grow {
  flex-grow: 1;
}

.el-header {
  padding: 0;
  height: auto;
}

.el-menu {
  width: 100%;
}
</style> 