<template>
  <div class="metrics-view">
    <el-card class="metrics-card">
      <template #header>
        <div class="card-header">
          <span>指标分析</span>
          <div class="header-controls">
            <el-select v-model="timeRange" placeholder="选择时间范围">
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
              <el-option label="本年" value="year" />
            </el-select>
            <el-button type="primary" @click="testMetrics">测试指标功能</el-button>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div style="padding: 20px">
            <el-skeleton-item variant="p" style="width: 100%" />
            <el-skeleton-item variant="p" style="width: 100%" />
            <el-skeleton-item variant="p" style="width: 60%" />
          </div>
        </template>

        <!-- 实际内容 -->
        <template #default>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          <div v-else>
            <!-- 当前指标 -->
            <div v-if="currentMetrics" class="metrics-section">
              <h3>当前指标</h3>
              <pre>{{ JSON.stringify(currentMetrics, null, 2) }}</pre>
            </div>

            <!-- 统计数据 -->
            <div v-if="metricsStats" class="metrics-section">
              <h3>统计数据</h3>
              <pre>{{ JSON.stringify(metricsStats, null, 2) }}</pre>
            </div>

            <!-- 趋势数据 -->
            <div v-if="metricsTrend" class="metrics-section">
              <h3>趋势数据</h3>
              <pre>{{ JSON.stringify(metricsTrend, null, 2) }}</pre>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDiaryStore } from '@/stores/diary'

export default {
  name: 'MetricsView',
  setup() {
    const diaryStore = useDiaryStore()
    const loading = ref(false)
    const error = ref(null)
    const timeRange = ref('week')
    const currentMetrics = ref(null)
    const metricsStats = ref(null)
    const metricsTrend = ref(null)

    const testMetrics = async () => {
      loading.value = true
      error.value = null
      try {
        // 测试心情指标数据
        const metrics = await diaryStore.fetchMetricsData('mood', timeRange.value)
        currentMetrics.value = metrics

        // 获取统计数据
        const today = new Date()
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        const stats = await diaryStore.fetchMetricsStats(startDate, today)
        metricsStats.value = stats

        // 获取趋势数据
        const trend = await diaryStore.fetchMetricsTrend('mood', timeRange.value)
        metricsTrend.value = trend

        ElMessage.success('指标数据获取成功')
      } catch (err) {
        error.value = err.message || '获取指标数据失败'
        ElMessage.error(error.value)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      error,
      timeRange,
      currentMetrics,
      metricsStats,
      metricsTrend,
      testMetrics
    }
  }
}
</script>

<style scoped>
.metrics-view {
  padding: 20px;
}

.metrics-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 16px;
}

.metrics-section {
  margin-bottom: 24px;
}

.metrics-section h3 {
  margin-bottom: 16px;
  color: #606266;
}

.error-message {
  color: #f56c6c;
  padding: 20px;
  text-align: center;
}

pre {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 