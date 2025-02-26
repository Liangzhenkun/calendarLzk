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

export function getDiaryDetail(id) {
  return request({
    url: `/api/diary/${id}`,
    method: 'get'
  })
}

export function updateDiary(id, data) {
  return request({
    url: `/api/diary/${id}`,
    method: 'put',
    data
  })
}

export function deleteDiary(id) {
  return request({
    url: `/api/diary/${id}`,
    method: 'delete'
  })
} 