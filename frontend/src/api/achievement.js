import request from '@/utils/axios'

export function getAchievements() {
  return request.get('/api/achievement/list')
}

export function getUserAchievements() {
  return request.get('/api/achievement/user')
}

export function checkProgress() {
  return request.post('/api/achievement/check')
}

export function getAchievementStreak() {
  return request.get('/api/achievement/streak')
}

export function recalculateStreak() {
  return request.post('/api/achievement/recalculate-streak')
} 