const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器错误' });
});

module.exports = app; 