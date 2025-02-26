const BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const api = {
  auth: {
    login: async (credentials) => {
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
          throw new Error(data.message || '登录失败');
        }

        return data;
      } catch (error) {
        console.error('Login API error:', error);
        throw error;
      }
    },
    register: async (userData) => {
      try {
        console.log('Register request:', userData);
        const response = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        console.log('Register response:', data);

        if (!response.ok) {
          throw new Error(data.message || '注册失败');
        }

        return data;
      } catch (error) {
        console.error('Register API error:', error);
        throw error;
      }
    },
  },
  calendar: {
    getRecords: async () => {
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        throw new Error('用户未登录');
      }

      const { id: userId } = JSON.parse(userInfo);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      
      try {
        const response = await fetch(
          `${BASE_URL}/calendar/record/${userId}/${firstDay.toISOString().split('T')[0]}`,
          {
            headers: getAuthHeaders(),
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token过期或无效
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            window.location.href = '/login';
            throw new Error('登录已过期，请重新登录');
          }
          throw new Error(data.message || '获取记录失败');
        }
        
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('获取日历记录失败:', error);
        throw error;
      }
    },
    createOrUpdate: async (data) => {
      try {
        const response = await fetch(`${BASE_URL}/calendar/record`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || '保存记录失败');
        }
        return responseData;
      } catch (error) {
        console.error('保存日历记录失败:', error);
        throw error;
      }
    },
  },
  diary: {
    create: async (data) => {
      try {
        const response = await fetch(`${BASE_URL}/diary/create`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || '保存日记失败');
        }
        return responseData;
      } catch (error) {
        console.error('保存日记失败:', error);
        throw error;
      }
    },
  },
};

export default api; 