const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar');

// 获取所有日历记录
router.get('/', CalendarController.getAllRecords);

// 创建新记录
router.post('/', CalendarController.createRecord);

// 其他日历相关的路由...

module.exports = router; 