import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          redirect: '/calendar'
        },
        {
          path: 'calendar',
          name: 'Calendar',
          component: () => import('@/views/Calendar.vue')
        },
        {
          path: 'diary',
          name: 'Diary',
          component: () => import('@/views/Diary.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { guest: true }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  
  // 如果是访客页面（登录/注册）
  if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      // 已登录用户访问登录/注册页面，重定向到首页
      next('/calendar')
    } else {
      next()
    }
  }
  // 如果需要认证
  else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // 静默重定向到登录页，不显示错误提示
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 