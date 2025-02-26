import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/utils/axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token'))
  const userInfo = ref(JSON.parse(localStorage.getItem('user_info') || '{}'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const { token: newToken, user } = await axios.post('/api/auth/login', credentials)
      
      token.value = newToken
      userInfo.value = user
      
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('user_info', JSON.stringify(user))
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function register(userData) {
    try {
      const response = await axios.post('/api/auth/register', userData)
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  function logout() {
    token.value = null
    userInfo.value = {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    register,
    logout
  }
}) 