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

/* 响应式设计 */
/* 手机屏幕 (小于 768px) */
@media screen and (max-width: 767px) {
  .icp-info {
    font-size: 10px;
    padding: 8px;
    margin-top: 15px;
  }
}

/* 平板屏幕 (768px - 1024px) */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .icp-info {
    font-size: 11px;
    padding: 10px;
    margin-top: 18px;
  }
}

/* 大屏幕 (大于 1024px) */
@media screen and (min-width: 1025px) {
  .icp-info {
    font-size: 12px;
    padding: 10px;
    margin-top: 20px;
  }
}
</style> 