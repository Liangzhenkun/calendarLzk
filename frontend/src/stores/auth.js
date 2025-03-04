import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/axios'
import i18n from '@/i18n'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(sessionStorage.getItem('access_token'))
  const refreshToken = ref(sessionStorage.getItem('refresh_token'))
  const userInfo = ref(JSON.parse(sessionStorage.getItem('user_info') || '{}'))
  const language = ref(localStorage.getItem('language') || 'zh')
  const refreshTokenTimeout = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''))
      return JSON.parse(jsonPayload)
    } catch (e) {
      return null
    }
  }

  function startRefreshTokenTimer(token) {
    const jwtToken = parseJwt(token)
    if (!jwtToken) return

    // 在 token 过期前 1 分钟刷新
    const expires = new Date(jwtToken.exp * 1000)
    const timeout = expires.getTime() - Date.now() - (1 * 60 * 1000)
    refreshTokenTimeout.value = setTimeout(refreshAccessToken, timeout)
  }

  function stopRefreshTokenTimer() {
    if (refreshTokenTimeout.value) {
      clearTimeout(refreshTokenTimeout.value)
    }
  }

  async function refreshAccessToken() {
    try {
      const response = await axios.post('/api/auth/refresh-token', {
        refreshToken: refreshToken.value
      })
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data.data
      
      accessToken.value = newAccessToken
      refreshToken.value = newRefreshToken
      userInfo.value = user
      
      sessionStorage.setItem('access_token', newAccessToken)
      sessionStorage.setItem('refresh_token', newRefreshToken)
      sessionStorage.setItem('user_info', JSON.stringify(user))
      
      startRefreshTokenTimer(newAccessToken)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  async function login(credentials) {
    try {
      console.log('Auth Store: 开始登录请求，请求数据:', {
        url: '/api/auth/login',
        method: 'POST',
        credentials
      });

      const response = await axios.post('/api/auth/login', credentials);
      
      console.log('Auth Store: 收到登录响应:', {
        status: response?.status,
        statusText: response?.statusText,
        data: response?.data,
        headers: response?.headers
      });

      // 添加响应数据的空值检查
      if (!response) {
        console.error('Auth Store: 登录响应为空');
        throw new Error('登录响应为空');
      }

      if (!response.data) {
        console.error('Auth Store: 登录响应数据为空');
        throw new Error('登录响应数据为空');
      }

      const responseData = response.data;
      
      if (responseData.code === 0 && responseData.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = responseData.data;
        
        console.log('Auth Store: 解析响应数据:', {
          hasAccessToken: !!newAccessToken,
          hasRefreshToken: !!newRefreshToken,
          hasUser: !!user
        });

        accessToken.value = newAccessToken;
        refreshToken.value = newRefreshToken;
        userInfo.value = user;
        
        sessionStorage.setItem('access_token', newAccessToken);
        sessionStorage.setItem('refresh_token', newRefreshToken);
        sessionStorage.setItem('user_info', JSON.stringify(user));
        
        startRefreshTokenTimer(newAccessToken);
        return responseData;
      } else {
        console.error('Auth Store: 登录响应格式错误:', responseData);
        throw new Error(responseData.message || '登录失败');
      }
    } catch (error) {
      console.error('Auth Store: 登录失败:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async function register(userData) {
    try {
      const response = await axios.post('/api/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  async function logout() {
    try {
      console.log('Auth Store: 开始退出操作');
      if (accessToken.value) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // 停止 token 刷新定时器
      stopRefreshTokenTimer();
      
      // 清除所有状态
      accessToken.value = null;
      refreshToken.value = null;
      userInfo.value = {};
      
      // 清除存储的数据
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_info');
      
      console.log('Auth Store: 状态已清除，准备重定向到登录页面');
      
      // 强制重定向到登录页面
      router.push('/login');
    }
  }

  function setLanguage(lang) {
    language.value = lang
    localStorage.setItem('language', lang)
    i18n.global.locale.value = lang
  }

  // 检查初始 token 是否有效
  onMounted(() => {
    if (accessToken.value) {
      const jwtToken = parseJwt(accessToken.value)
      if (jwtToken && jwtToken.exp * 1000 > Date.now()) {
        startRefreshTokenTimer(accessToken.value)
      } else {
        logout()
      }
    }
  })

  return {
    accessToken,
    refreshToken,
    userInfo,
    isAuthenticated,
    login,
    register,
    logout,
    language,
    setLanguage,
    refreshAccessToken
  }
}) 