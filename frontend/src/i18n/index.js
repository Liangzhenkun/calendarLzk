import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    login: {
      title: '登录',
      username: '用户名',
      password: '密码',
      submit: '登录',
      register: '注册账号',
      rememberMe: '记住我',
      usernameRequired: '请输入用户名',
      passwordRequired: '请输入密码'
    },
    register: {
      title: '注册',
      username: '用户名',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      submit: '注册',
      login: '已有账号？去登录',
      usernameRequired: '请输入用户名',
      emailRequired: '请输入邮箱',
      passwordRequired: '请输入密码',
      confirmPasswordRequired: '请确认密码',
      passwordMismatch: '两次输入的密码不一致'
    },
    calendar: {
      today: '今天',
      diary: '日记',
      mood: '心情',
      weather: '天气',
      content: '内容',
      save: '保存',
      cancel: '取消',
      weatherOptions: {
        sunny: '晴天',
        cloudy: '多云',
        rainy: '下雨',
        snowy: '下雪'
      }
    },
    common: {
      success: '成功',
      error: '错误',
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑'
    }
  }
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh', // 设置默认语言
  fallbackLocale: 'zh', // 设置回退语言
  messages
})

export default i18n 