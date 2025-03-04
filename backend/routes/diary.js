const express = require('express');
const router = express.Router();
const { DiaryService } = require('../services/diary.service');
const auth = require('../middleware/auth');

const diaryService = new DiaryService();

// 获取指定月份的日记
router.get('/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;
    const diaries = await diaryService.getMonthDiaries(userId, parseInt(year), parseInt(month));
    res.json(diaries);
  } catch (error) {
    console.error('Error fetching month diaries:', error);
    res.status(500).json({ error: '获取日记失败' });
  }
});

// 获取指定日期的日记
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const diary = await diaryService.getDiaryByDate(userId, date);
    
    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }
    
    res.json(diary);
  } catch (error) {
    console.error('Error fetching diary:', error);
    res.status(500).json({ error: '获取日记失败' });
  }
});

// 创建或更新日记
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const diaryData = req.body;
    
    const result = await diaryService.saveDiary(userId, diaryData);
    res.json({
      success: true,
      id: result.id,
      message: '日记保存成功'
    });
  } catch (error) {
    console.error('Error saving diary:', error);
    res.status(500).json({ error: '保存日记失败' });
  }
});

// 删除日记
router.delete('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    await diaryService.deleteDiary(userId, date);
    res.json({
      success: true,
      message: '日记删除成功'
    });
  } catch (error) {
    console.error('Error deleting diary:', error);
    res.status(500).json({ error: '删除日记失败' });
  }
});

module.exports = router; 