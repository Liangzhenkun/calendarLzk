module.exports = app => {
  const { router, controller, middleware } = app;
  const jwt = middleware.auth();

  // 公开路由
  router.post('/api/auth/login', controller.auth.login);
  router.post('/api/auth/register', controller.auth.register);

  //测试路由
  router.get('/api/test', controller.test.index);

  // 日历相关路由
  router.get('/api/calendar/records', jwt, controller.calendar.getRecords);
  router.post('/api/calendar/record', jwt, controller.calendar.createOrUpdate);

  // 日记相关路由
  router.post('/api/diary/create', jwt, controller.diary.create);
  router.get('/api/diary/list', jwt, controller.diary.list);
  router.get('/api/diary/:id', jwt, controller.diary.detail);
  router.put('/api/diary/:id', jwt, controller.diary.update);
  router.delete('/api/diary/:id', jwt, controller.diary.delete);
}; 
