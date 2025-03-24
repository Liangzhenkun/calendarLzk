import request from '@/utils/axios'

// 获取用户的日常任务
export function getDailyTasks() {
  return request({
    url: '/tasks/daily',
    method: 'get'
  })
}

// 完成任务
export function completeTask(taskId) {
  return request({
    url: '/tasks/complete',
    method: 'post',
    data: { taskId }
  })
}

// 获取任务历史记录
export function getTaskHistory() {
  return request({
    url: '/tasks/history',
    method: 'get'
  })
} 