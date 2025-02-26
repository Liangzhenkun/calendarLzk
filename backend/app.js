module.exports = app => {
  app.beforeStart(async () => {
    // 应用会等待这个函数执行完才启动
    await require('./app/init/database')(app);
  });
}; 