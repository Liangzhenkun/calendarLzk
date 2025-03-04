import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

// 创建 axios 实例
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',  // 修改为后端实际运行的端口
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
        console.log('Axios 响应拦截器:', {
            status: response.status,
            data: response.data,
            hasData: !!response.data,
            hasCode: 'code' in response.data
        });

        // 返回完整的响应对象
        return response;
    },
    async error => {
        console.error('Axios 错误拦截器:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL
            }
        });

        if (error.response) {
            const authStore = useAuthStore();

            switch (error.response.status) {
                case 401:
                    // 如果是 token 过期错误，尝试刷新 token
                    if (error.response.data?.message === 'Token expired' && !error.config._retry) {
                        error.config._retry = true;
                        try {
                            await authStore.refreshAccessToken();
                            error.config.headers.Authorization = `Bearer ${authStore.accessToken}`;
                            return instance(error.config);
                        } catch (refreshError) {
                            // 如果刷新 token 失败，清除认证信息并跳转到登录页
                            authStore.logout();
                            router.push('/login');
                            ElMessage.error('登录已过期，请重新登录');
                            return Promise.reject(refreshError);
                        }
                    }
                    // 其他 401 错误
                    authStore.logout();
                    router.push('/login');
                    ElMessage.error('认证失败，请重新登录');
                    break;
                case 403:
                    ElMessage.error('没有权限访问');
                    break;
                case 404:
                    ElMessage.error('请求的资源不存在');
                    break;
                default:
                    ElMessage.error(error.response.data?.message || '请求失败');
            }
        } else if (error.request) {
            ElMessage.error('网络错误，请检查网络连接');
        } else {
            ElMessage.error('请求配置错误');
        }
        return Promise.reject(error);
    }
);

export default instance; 