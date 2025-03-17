import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

// 使用环境变量配置API基础路径
const baseURL = import.meta.env.VITE_API_URL || window.location.origin;

// 创建 axios 实例
const instance = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true  // 允许跨域请求携带凭证
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
            hasCode: typeof response.data === 'object' && response.data !== null ? 'code' in response.data : false
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

            // 如果响应中包含具体错误信息，优先使用它
            const errorMessage = typeof error.response.data === 'object' && error.response.data !== null
                ? error.response.data.message || error.response.data.error || '请求失败'
                : '请求失败';

            switch (error.response.status) {
                case 401:
                    // 如果是 token 过期错误，尝试刷新 token
                    if (errorMessage === 'Token expired' && !error.config._retry) {
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
                    ElMessage.error(errorMessage);
                    break;
                default:
                    ElMessage.error(errorMessage);
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