module.exports = app => {
  const { router, controller, middleware } = app;
  const jwt = middleware.auth();

  // 公开路由
  router.post('/api/auth/login', controller.auth.login);
  router.post('/api/auth/register', controller.auth.register);

  // 需要认证的路由
  router.get('/api/calendar/records', jwt, controller.calendar.getRecords);
  router.post('/api/calendar/record', jwt, controller.calendar.createOrUpdate);
}; 