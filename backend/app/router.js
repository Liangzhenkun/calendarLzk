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

  // 日记相关路由 - 注意路由顺序很重要
  router.get('/diary/list', jwt, controller.diary.index);  // 放在具体路径前面
  router.post('/diary/create', jwt, controller.diary.create);
  router.get('/diary/metrics/:metric', jwt, controller.metrics.getData);
  router.get('/diary/metrics/stats', jwt, controller.metrics.getStats);
  router.get('/diary/metrics/trend/:metric', jwt, controller.metrics.getTrend);
  router.get('/diary/:date', jwt, controller.diary.show);  // 通配路由放在最后
  router.put('/diary/:date', jwt, controller.diary.update);
  router.delete('/diary/:date', jwt, controller.diary.destroy);

  // 日历相关路由
  router.get('/calendar/records', jwt, controller.calendar.getRecords);
  router.post('/calendar/record', jwt, controller.calendar.createOrUpdate);
  
  // 成就相关路由
  router.get('/achievements/all', jwt, controller.achievement.getAll);
  router.get('/achievements/user', jwt, controller.achievement.getUserAchievements);
  router.post('/achievements/check', jwt, controller.achievement.checkProgress);
  
  // 任务相关路由
  router.get('/tasks/daily', jwt, controller.dailyTask.getDailyTasks);
  router.post('/tasks/complete', jwt, controller.dailyTask.completeTask);
  router.get('/tasks/history', jwt, controller.dailyTask.getTaskHistory);
  
  // 商店相关路由
  router.get('/shop/items', jwt, controller.shop.getItems);
  router.post('/shop/purchase', jwt, controller.shop.purchaseItem);
  router.get('/shop/user-items', jwt, controller.shop.getUserItems);
  router.post('/shop/use-item', jwt, controller.shop.useItem);
// 调试路由
router.get('/debug/delete-diary/:date', jwt, controller.debug.testDeleteDiary);
}; 
