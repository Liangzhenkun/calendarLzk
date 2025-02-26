const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
const BASE_URL = 'http://localhost:3001';

const authService = {
  login: async (credentials) => {
    try {
      console.log('Attempting login with credentials:', credentials);

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Unexpected response type:', contentType);
        throw new Error('服务器返回了非预期的响应类型');
      }

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('Failed to parse response as JSON:', error);
        throw new Error('服务器响应格式错误');
      }

      console.log('Parsed login response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 确保token存在
      if (!data.token) {
        throw new Error('登录响应中缺少token');
      }

      // 保存token和用户信息
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: data.userId,
        username: credentials.username
      }));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Registering user:', userData);
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
      });

      const text = await response.text();
      console.log('Raw register response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('Failed to parse register response as JSON:', error);
        throw new Error('服务器响应格式错误');
      }

      console.log('Register response:', data);

      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    try {
      // 检查token是否过期
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp < Date.now() / 1000) {
        authService.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      authService.logout();
      return false;
    }
  },

  getCurrentUser: () => {
    try {
      const userInfo = localStorage.getItem(USER_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};

export default authService;