const dotenv = require('dotenv');
const path = require('path');

// 加载 .env 文件
const envPath = path.join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1234567890';

  // add your middleware config here
  config.middleware = [];

  // JWT 配置
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    process.exit(1);
  }

  config.jwt = {
    secret: jwtSecret,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '24h',
  };

  // 配置路径前缀
  config.prefix = '/api';

  // 从环境变量获取允许的域名列表
  const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean);

  // 关闭 CSRF
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: corsOrigins.length ? corsOrigins : ['https://seefu.cn', 'https://www.seefu.cn']
  };

  // 配置 CORS
  config.cors = {
    origin: ctx => {
      const requestOrigin = ctx.get('Origin');
      if (corsOrigins.length) {
        return corsOrigins.includes(requestOrigin) ? requestOrigin : false;
      }
      return ['https://seefu.cn', 'https://www.seefu.cn'].includes(requestOrigin) ? requestOrigin : false;
    },
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400
  };

  // MySQL 配置
  config.mysql = {
    client: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'calendar',
    },
  };

  // 日志配置
  config.logger = {
    dir: 'logs',
    appLogName: 'calendar-server-web.log',
    level: process.env.LOG_LEVEL || 'DEBUG',
    consoleLevel: process.env.LOG_LEVEL || 'DEBUG',
  };

  // 端口配置
  config.cluster = {
    listen: {
      port: parseInt(process.env.PORT || '7001', 10),
      hostname: '0.0.0.0',
    },
  };

  return {
    ...config,
  };
}; 