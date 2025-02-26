import axios from '../utils/axios';

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
    login: (data) => axios.post('/auth/login', data),
    register: (data) => axios.post('/auth/register', data),
  },
  calendar: {
    getRecords: () => axios.get('/calendar/records'),
    createOrUpdate: (data) => axios.post('/calendar/record', data),
  },
  diary: {
    create: (data) => axios.post('/diary/create', data),
  },
};

export default api;