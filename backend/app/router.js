module.exports = app => {
  const { router, controller, middleware } = app;
  const jwt = middleware.auth();

  // 配置路由前缀
  router.prefix('/api');

  // 公开路由
  router.post('/auth/login', controller.auth.login);
  router.post('/auth/register', controller.auth.register);

  // 日记相关路由 - 注意路由顺序很重要
  router.get('/diary/list', jwt, controller.diary.list);  // 放在具体路径前面
  router.post('/diary/create', jwt, controller.diary.create);
  router.get('/diary/metrics/:metric', jwt, controller.metrics.getData);
  router.get('/diary/metrics/stats', jwt, controller.metrics.getStats);
  router.get('/diary/metrics/trend/:metric', jwt, controller.metrics.getTrend);
  router.get('/diary/:date', jwt, controller.diary.getByDate);  // 通配路由放在最后
  router.put('/diary/:date', jwt, controller.diary.update);
  router.delete('/diary/:date', jwt, controller.diary.delete);

  // 日历相关路由
  router.get('/calendar/records', jwt, controller.calendar.getRecords);
  router.post('/calendar/record', jwt, controller.calendar.createOrUpdate);
}; 