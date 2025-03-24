import request from '@/utils/axios'

// 获取所有成就
export function getAllAchievements() {
  return request({
    url: '/achievements/all',
    method: 'get'
  })
}

// 获取用户已解锁的成就
export function getUserAchievements() {
  return request({
    url: '/achievements/user',
    method: 'get'
  })
}

// 检查成就进度
export function checkAchievementProgress() {
  return request({
    url: '/achievements/check',
    method: 'post'
  })
} 