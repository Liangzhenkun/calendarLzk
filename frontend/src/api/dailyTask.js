import request from '@/utils/axios'

export function getDailyTasks() {
  return request({
    url: '/api/tasks/daily',
    method: 'get'
  })
}

export function completeTask(taskId) {
  return request({
    url: '/api/tasks/complete',
    method: 'post',
    data: { taskId }
  })
}

export function getTaskHistory() {
  return request({
    url: '/api/tasks/history',
    method: 'get'
  })
} 