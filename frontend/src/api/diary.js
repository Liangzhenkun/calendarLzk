import request from '@/utils/axios'

export function createDiary(data) {
  // 确保数据格式正确
  const formattedData = {
    title: data.title || '',
    content: data.content || '',
    date: data.date, // 确保日期格式为 YYYY-MM-DD
    mood: parseInt(data.mood || 3, 10),
    weather: data.weather || 'sunny',
    type: data.type || 'normal',
    metrics: {
      sleepQuality: parseInt(data.metrics?.sleepQuality || 5, 10),
      stressLevel: parseInt(data.metrics?.stressLevel || 5, 10),
      productivity: parseInt(data.metrics?.productivity || 5, 10)
    }
  }
  
  console.log('准备发送到后端的日记数据:', JSON.stringify(formattedData));
  
  return request({
    url: '/api/diary',
    method: 'post',
    data: formattedData
  }).then(response => {
    console.log('创建日记响应:', response);
    return response;
  }).catch(error => {
    console.error('API 调用 createDiary 失败:', error);
    console.error('错误响应数据:', error.response?.data);
    throw error;
  })
}

export function getDiaryList(params) {
  return request({
    url: '/api/diary',
    method: 'get',
    params
  })
}

export function getDiaryDetail(date) {
  return request({
    url: `/api/diary/${date}`,
    method: 'get'
  })
}

export function updateDiary(date, data) {
  return request({
    url: `/api/diary/${date}`,
    method: 'put',
    data
  })
}

export function deleteDiary(date) {
  console.log('API 调用 deleteDiary，日期:', date);
  return request({
    url: `/api/diary/${date}`,
    method: 'delete'
  })
}

export function getMetrics(metric, range) {
  return request({
    url: `/api/diary/metrics/${metric}`,
    method: 'get',
    params: { range }
  })
}

export function getMetricsStats(startDate, endDate) {
  return request({
    url: '/api/diary/metrics/stats',
    method: 'get',
    params: { startDate, endDate }
  })
}

export function getMetricsTrend(metric, period) {
  return request({
    url: `/api/diary/metrics/trend/${metric}`,
    method: 'get',
    params: { period }
  })
} 