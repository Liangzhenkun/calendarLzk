const dotenv = require('dotenv');
dotenv.config();

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
      password: '964213444lzk',
      database: 'calendar'
    },
  };

  // 日志配置
  config.logger = {
    dir: 'logs',
    appLogName: 'calendar-server-web.log',
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://localhost:3000'],
  };

  // CORS 配置
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  };

  // JWT配置
  config.jwt = {
    secret: 'your-jwt-secret',
    expiresIn: '7d'
  };

  // 端口配置
  config.cluster = {
    listen: {
      port: 3001,
    },
  };

  return config;
}; 