const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 连接数据库
mongoose.connect('mongodb://localhost:27017/calendar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log('数据库连接成功'))
  .catch((err) => console.error('数据库连接失败:', err));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'Bruce',
    password: '123456lzk',
    database: 'calendar'
});

// 连接数据库
db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err.stack);
        return;
    }
    console.log('成功连接到数据库');
});

// 路由
app.use('/api/auth', require('./src/routes/auth'));
const calendarRoutes = require('./src/routes/calendar');

app.use('/api/calendar', calendarRoutes);

app.get('/', (req, res) => {
  res.send('欢迎使用日历应用 API');
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    
    db.query(checkQuery, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
