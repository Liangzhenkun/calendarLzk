module.exports = app => {
  const { router, controller, middleware } = app;
  const jwt = middleware.auth();

  // 配置路由前缀
  router.prefix('/api');

  // 健康检查路由 - 无需认证
  router.get('/health', ctx => {
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '后端服务正常运行'
    };
  });

  // 公开路由
  router.post('/auth/login', controller.auth.login);
  router.post('/auth/register', controller.auth.register);

  // 日历相关路由
  router.get('/calendar/records', jwt, controller.calendar.getRecords);
  router.post('/calendar/record', jwt, controller.calendar.createOrUpdate);

  // 日记相关路由
  router.post('/diary/create', jwt, controller.diary.create);
  router.get('/diary/list', jwt, controller.diary.list);
  router.get('/diary/:id', jwt, controller.diary.detail);
  router.put('/diary/:id', jwt, controller.diary.update);
  router.delete('/diary/:id', jwt, controller.diary.delete);

  // 指标相关路由
  router.get('/diary/metrics/:metric', jwt, controller.metrics.getData);
  router.get('/diary/metrics/stats', jwt, controller.metrics.getStats);
  router.get('/diary/metrics/trend/:metric', jwt, controller.metrics.getTrend);
  
  // 反馈相关路由
  router.post('/feedback', controller.feedback.submit); // 不需要登录也可以提交反馈
}; 