'use strict';

const Controller = require('egg').Controller;

class DiaryController extends Controller {
  // 获取用户的所有日记
  async index() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    
    try {
      const diaries = await service.diary.getDiaries(userId);
      ctx.body = diaries;
    } catch (error) {
      ctx.logger.error('获取日记列表失败:', error);
      ctx.status = 500;
      ctx.body = { message: '获取日记列表失败', error: error.message };
    }
  }

  // 创建新日记
  async create() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const diaryData = {
      ...ctx.request.body,
      userId
    };
    
    try {
      const diary = await service.diary.create(diaryData);
      ctx.status = 201;
      ctx.body = diary;
    } catch (error) {
      ctx.logger.error('创建日记失败:', error);
      ctx.status = 400;
      ctx.body = { message: '创建日记失败', error: error.message };
    }
  }

  // 获取特定日记
  async show() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;
    
    try {
      const diary = await service.diary.getByDate(userId, date);
      
      if (!diary) {
        ctx.status = 404;
        ctx.body = { message: '日记不存在' };
        return;
      }
      
      ctx.body = diary;
    } catch (error) {
      ctx.logger.error('获取日记详情失败:', error);
      ctx.status = 500;
      ctx.body = { message: '获取日记详情失败', error: error.message };
    }
  }

  // 更新日记
  async update() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;
    const updateData = ctx.request.body;
    
    try {
      const result = await service.diary.updateByDate(userId, date, updateData);
      
      if (!result) {
        ctx.status = 404;
        ctx.body = { message: '日记不存在' };
        return;
      }
      
      ctx.body = { message: '日记更新成功' };
    } catch (error) {
      ctx.logger.error('更新日记失败:', error);
      ctx.status = 400;
      ctx.body = { message: '更新日记失败', error: error.message };
    }
  }

  // 删除日记
  async destroy() {
    const { ctx, service } = this;
    const userId = ctx.state.user.id;
    const date = ctx.params.date;
    
    try {
      const result = await service.diary.deleteByDate(userId, date);
      
      if (!result) {
        ctx.status = 404;
        ctx.body = { message: '日记不存在' };
        return;
      }
      
      ctx.body = { message: '日记删除成功' };
    } catch (error) {
      ctx.logger.error('删除日记失败:', error);
      ctx.status = 500;
      ctx.body = { message: '删除日记失败', error: error.message };
    }
  }
}

module.exports = DiaryController; 