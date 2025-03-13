module.exports = app => {
  const { router, controller, middleware } = app;
  const jwt = middleware.auth();

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
}; 