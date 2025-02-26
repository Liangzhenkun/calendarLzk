module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1234567890';

  // 数据库配置
  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '964213444lzk',  // 更新为你设置的新密码
      database: 'calendar'
    },
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://localhost:3000'], // 前端域名
  };

  // CORS 配置
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  // JWT配置
  config.jwt = {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
  };

  // 端口配置
  config.cluster = {
    listen: {
      port: process.env.PORT || 3001,
    },
  };

  return config;
}; 