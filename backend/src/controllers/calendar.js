const Calendar = require('../models/Calendar');

// 获取所有日历记录
exports.getAllRecords = async (req, res) => {
  try {
    const records = await Calendar.find({ userId: req.user.id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建新记录
exports.createRecord = async (req, res) => {
  try {
    const { date, content, mood, tags } = req.body;
    const record = new Calendar({
      userId: req.user.id,
      date,
      content,
      mood,
      tags
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: '创建记录失败' });
  }
};

// 其他处理函数可以在这里添加...
