<!-- ICP备案信息组件 -->
<template>
  <div class="icp-info">
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2025155032号-1</a>
  </div>
</template>

<script setup>
</script>

<style scoped>
.icp-info {
  position: static;  /* 使用静态定位，作为普通内容 */
  width: 100%;
  text-align: center;
  padding: 10px;
  font-size: 12px;
  margin-top: 20px;  /* 与上方内容保持一定距离 */
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