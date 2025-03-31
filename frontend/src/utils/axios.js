import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

// 解析环境变量中的多域名配置
const parseApiUrls = (urlString) => {
  return urlString.split(',').map(url => url.trim());
};

// 获取当前域名
const getCurrentDomain = () => {
  return window.location.hostname;
};

// 选择匹配的 API URL
const selectApiUrl = (urls) => {
  const currentDomain = getCurrentDomain();
  return urls.find(url => {
    const urlDomain = new URL(url).hostname;
    return urlDomain === currentDomain || urlDomain === `www.${currentDomain}`;
  }) || urls[0]; // 如果没找到匹配的，使用第一个 URL
};

// 使用环境变量配置API基础路径
const apiUrls = parseApiUrls(import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}`);
const baseURL = selectApiUrl(apiUrls);

// 创建 axios 实例
const instance = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true  // 始终允许跨域请求携带凭证
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        // 确保 URL 以 /api 开头
        if (!config.url.startsWith('/api/')) {
            config.url = `/api${config.url}`;
        }
        
        console.log('Axios 请求配置:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            withCredentials: config.withCredentials,
            headers: config.headers
        });

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
        console.log('Axios 响应:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    async error => {
        console.error('Axios 错误:', {
            message: error.message,
            config: error.config ? {
                url: error.config.url,
                method: error.config.method,
                baseURL: error.config.baseURL,
                withCredentials: error.config.withCredentials
            } : undefined,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                data: error.response.data
            } : undefined
        });

        if (error.response) {
            const authStore = useAuthStore();

            // 如果响应中包含具体错误信息，优先使用它
            const errorMessage = error.response.data?.message || error.response.data?.error || '请求失败';

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