<template>
  <el-config-provider>
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}
</style> 