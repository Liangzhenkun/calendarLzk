import axios from 'axios'

const instance = axios.create({
  baseURL: '',
  timeout: 10000,
  withCredentials: true
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export const api = {
  auth: {
    login: (data) => instance.post('/api/auth/login', data),
    register: (data) => instance.post('/api/auth/register', data)
  },
  calendar: {
    getRecords: () => instance.get('/api/calendar/records'),
    createOrUpdate: (data) => instance.post('/api/calendar/record', data)
  }
}

export default api 