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
    const { userId, date, content, mood, tags } = req.body;
    
    // 查找是否已存在记录
    const existingRecord = await Calendar.findByUserAndDate(userId, date);
    
    if (existingRecord) {
        // 更新现有记录
        await Calendar.update(existingRecord.id, { content, mood, tags });
        res.json({ message: '记录已更新' });
    } else {
        // 创建新记录
        const id = await Calendar.create({ userId, date, content, mood, tags });
        res.status(201).json({ 
            message: '记录已创建',
            id 
        });
    }
};

// 获取日历记录
exports.getRecord = async (req, res) => {
    const { userId, date } = req.params;
    const record = await Calendar.findByUserAndDate(userId, date);
    
    if (!record) {
        return res.status(404).json({ message: '没有找到记录' });
    }
    
    res.json(record);
};

// 其他处理函数可以在这里添加...
