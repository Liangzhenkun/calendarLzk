import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import i18n from './i18n'
import Vue3TouchEvents from 'vue3-touch-events'

// 导入样式
import './assets/styles/ios-variables.scss'
import './assets/styles/ios-element.scss'
import './assets/styles/animations.css'
import './assets/main.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 配置 axios 默认值
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(i18n)
app.use(Vue3TouchEvents)

app.mount('#app') 