import axios from 'axios'

// 根据环境判断 baseURL
const baseURL = import.meta.env.PROD 
  ? import.meta.env.VITE_APP_API_URL  // 生产环境使用配置的 API URL
  : ''                                // 开发环境使用代理

const instance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 移除重复的 /api 前缀
    if (config.url.startsWith('/api/api/')) {
      config.url = config.url.replace('/api/api/', '/api/')
    }
    
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