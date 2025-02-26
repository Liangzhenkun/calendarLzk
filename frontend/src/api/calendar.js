import request from '@/utils/axios'

export function getCalendarRecords(date) {
  return request({
    url: '/api/calendar/records',
    method: 'get',
    params: { date }
  })
}

export function createCalendarRecord(data) {
  return request({
    url: '/api/calendar/record',
    method: 'post',
    data
  })
}

export function updateCalendarRecord(id, data) {
  return request({
    url: `/api/calendar/record/${id}`,
    method: 'put',
    data
  })
}

export function deleteCalendarRecord(id) {
  return request({
    url: `/api/calendar/record/${id}`,
    method: 'delete'
  })
} 