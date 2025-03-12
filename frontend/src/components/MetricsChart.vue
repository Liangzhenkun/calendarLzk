<template>
  <div class="metrics-chart">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="time-range">
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button label="week">一周内</el-radio-button>
          <el-radio-button label="month">一个月内</el-radio-button>
          <el-radio-button label="quarter">三个月内</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="chart-container" ref="chartContainer"></div>

    <div class="metrics-summary">
      <el-row :gutter="20">
        <el-col :span="8" v-for="stat in statistics" :key="stat.label">
          <div class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  }
});

const timeRange = ref('week');
const chartContainer = ref(null);
let chart = null;

const statistics = ref([
  { label: '平均值', value: '0', color: '#409EFF' },
  { label: '最高值', value: '0', color: '#67C23A' },
  { label: '最低值', value: '0', color: '#F56C6C' }
]);

const handleTimeRangeChange = (value) => {
  // 触发父组件更新数据
  emit('range-change', value);
};

const initChart = () => {
  if (!chartContainer.value) return;
  
  chart = echarts.init(chartContainer.value);
  updateChart();
};

const updateChart = () => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 5
    },
    series: [{
      name: props.title,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: props.data.map(item => [item.date, item.value]),
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.1)' }
        ])
      }
    }]
  };

  chart.setOption(option);
};

const updateStatistics = () => {
  if (!props.data.length) return;

  const values = props.data.map(item => item.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  statistics.value = [
    { label: '平均值', value: avg.toFixed(1), color: '#409EFF' },
    { label: '最高值', value: max.toFixed(1), color: '#67C23A' },
    { label: '最低值', value: min.toFixed(1), color: '#F56C6C' }
  ];
};

watch(() => props.data, () => {
  updateChart();
  updateStatistics();
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => {
    chart?.resize();
  });
});

defineExpose({
  updateChart
});
</script>

<style scoped>
.metrics-chart {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
}

.chart-container {
  height: 300px;
  margin-bottom: 20px;
}

.metrics-summary {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 10px;
  }

  .time-range {
    width: 100%;
  }

  .chart-container {
    height: 200px;
  }

  .stat-card {
    margin-bottom: 10px;
  }
}
</style> 