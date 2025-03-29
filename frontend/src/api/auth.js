import request from '@/utils/axios'
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';

export function login(data) {
  return request({
    url: `${API_PREFIX}/auth/login`,
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: `${API_PREFIX}/auth/register`,
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: `${API_PREFIX}/auth/logout`,
    method: 'post'
  })
}

export function refreshToken(data) {
  return request({
    url: `${API_PREFIX}/auth/refresh-token`,
    method: 'post',
    data
  })
} 