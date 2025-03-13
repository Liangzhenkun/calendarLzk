import request from '@/utils/axios'

export function createDiary(data) {
  return request({
    url: '/diary/create',
    method: 'post',
    data
  })
}

export function getDiaryList(params) {
  return request({
    url: '/diary/list',
    method: 'get',
    params
  })
}

export function getDiaryDetail(id) {
  return request({
    url: `/diary/${id}`,
    method: 'get'
  })
}

export function updateDiary(id, data) {
  return request({
    url: `/diary/${id}`,
    method: 'put',
    data
  })
}

export function deleteDiary(id) {
  return request({
    url: `/diary/${id}`,
    method: 'delete'
  })
}

export function getMetrics(metric, range) {
  return request({
    url: `/diary/metrics/${metric}`,
    method: 'get',
    params: { range }
  })
}

export function getMetricsStats(startDate, endDate) {
  return request({
    url: '/diary/metrics/stats',
    method: 'get',
    params: { startDate, endDate }
  })
}

export function getMetricsTrend(metric, period) {
  return request({
    url: `/diary/metrics/trend/${metric}`,
    method: 'get',
    params: { period }
  })
} 