import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Calendar from '@/views/Calendar.vue'
import MetricsView from '@/views/MetricsView.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/calendar'
      },
      {
        path: '/calendar',
        name: 'Calendar',
        component: Calendar,
        meta: { requiresAuth: true }
      },
      {
        path: '/metrics',
        name: 'metrics',
        component: MetricsView,
        meta: { requiresAuth: true }
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!sessionStorage.getItem('access_token')
  console.log('路由守卫:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth: to.matched.some(record => record.meta.requiresAuth)
  });

  // 需要认证的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('未认证，重定向到登录页面');
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  }
  // 访客路由（登录、注册）
  else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      console.log('已认证，重定向到日历页面');
      next('/calendar');
    } else {
      next();
    }
  }
  // 其他路由
  else {
    next();
  }
});

export default router 