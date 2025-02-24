const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/calendar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));