const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth'); // 导入控制器

// 注册路由
router.post('/register', AuthController.register);

// 登录路由
router.post('/login', AuthController.login);

module.exports = router;