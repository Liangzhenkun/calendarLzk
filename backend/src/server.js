const express = require('express');
const app = express();
const authRoutes = require('./routes/auth'); // 确保路径正确

app.use(express.json()); // 解析 JSON 请求体
app.use('/api/auth', authRoutes); // 挂载路由

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});