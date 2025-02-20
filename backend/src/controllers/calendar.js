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

// 创建或更新日历记录
exports.createOrUpdateRecord = async (req, res) => {
    const { userId, date, content } = req.body;

    try {
        const record = await Calendar.findOneAndUpdate(
            { userId, date },
            { content, createdAt: new Date() },
            { new: true, upsert: true } // 如果记录不存在则创建
        );
        res.status(200).json({ message: '记录保存成功', record });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 获取日历记录
exports.getRecord = async (req, res) => {
    const { userId, date } = req.params;

    try {
        const record = await Calendar.findOne({ userId, date });
        if (!record) {
            return res.status(404).json({ message: '没有找到记录' });
        }
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 其他处理函数可以在这里添加...
