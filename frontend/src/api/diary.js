import request from '@/utils/axios'

export function createDiary(data) {
  return request({
    url: '/api/diary/create',
    method: 'post',
    data
  })
}

export function getDiaryList(params) {
  return request({
    url: '/api/diary/list',
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