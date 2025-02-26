import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 创建 axios 实例
const instance = axios.create({
    baseURL: 'http://127.0.0.1:3001',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request:', config);
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response.data;
    },
    error => {
        console.error('Response Error:', error);
        console.error('Error Config:', error.config);
        console.error('Error Response:', error.response);

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error('登录已过期，请重新登录');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_info');
                    router.push('/login');
                    break;
                case 403:
                    ElMessage.error('没有权限访问');
                    break;
                case 404:
                    ElMessage.error('请求的资源不存在');
                    break;
                case 500:
                    ElMessage.error('服务器错误');
                    break;
                default:
                    ElMessage.error(error.response.data?.message || '请求失败');
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
            ElMessage.error('服务器无响应，请检查网络连接');
        } else {
            console.error('Request setup error:', error.message);
            ElMessage.error('请求配置错误');
        }
        return Promise.reject(error);
    }
);

export default instance; 