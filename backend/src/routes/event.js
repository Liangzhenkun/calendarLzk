const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// 创建事件
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, date } = req.body;
    const newEvent = new Event({ userId, title, description, date });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: '创建事件失败', error: error.message });
  }
});

// 获取用户的所有事件
router.get('/:userId', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.params.userId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: '获取事件失败', error: error.message });
  }
});

module.exports = router;