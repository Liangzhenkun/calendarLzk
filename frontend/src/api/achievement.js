import request from '@/utils/axios'

export function getAchievements() {
  return request({
    url: '/api/achievements/all',
    method: 'get'
  })
}

export function getUserAchievements() {
  return request({
    url: '/api/achievements/user',
    method: 'get'
  })
}

export function checkProgress() {
  return request({
    url: '/api/achievements/check',
    method: 'post'
  })
} 