import api from './api';

export const authApi = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  register: (username, password) => 
    api.post('/auth/register', { username, password }),
  
  // 设置认证 token
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }
};