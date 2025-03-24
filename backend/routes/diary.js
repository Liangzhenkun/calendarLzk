'use strict';

/**
 * 日记相关服务
 */
class DiaryService {
  constructor(ctx) {
    this.ctx = ctx;
    this.DiaryModel = ctx.model.Diary;
    this.UserModel = ctx.model.User;
  }

  /**
   * 获取用户的所有日记
   * @param {string} userId - 用户ID
   * @return {Promise<Array>} - 日记列表
   */
  async getDiaries(userId) {
    return this.DiaryModel.find({ userId }).sort({ date: -1 });
  }

  /**
   * 创建新日记
   * @param {string} userId - 用户ID
   * @param {Object} diaryData - 日记数据
   * @return {Promise<Object>} - 创建的日记
   */
  async createDiary(userId, diaryData) {
    const { title, content, mood } = diaryData;
    
    const diary = new this.DiaryModel({
      userId,
      title,
      content,
      mood,
      date: new Date(),
      exp: 10
    });
    
    await diary.save();

    // 更新用户经验值
    await this.UserModel.findByIdAndUpdate(
      userId,
      { $inc: { exp: diary.exp } }
    );

    return diary;
  }

  /**
   * 获取特定日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @return {Promise<Object>} - 日记数据
   */
  async getDiary(diaryId, userId) {
    return this.DiaryModel.findOne({
      _id: diaryId,
      userId
    });
  }

  /**
   * 更新日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @return {Promise<Object>} - 更新后的日记
   */
  async updateDiary(diaryId, userId, updateData) {
    const { title, content, mood } = updateData;
    
    return this.DiaryModel.findOneAndUpdate(
      { _id: diaryId, userId },
      { title, content, mood },
      { new: true }
    );
  }

  /**
   * 删除日记
   * @param {string} diaryId - 日记ID
   * @param {string} userId - 用户ID
   * @return {Promise<boolean>} - 删除结果
   */
  async deleteDiary(diaryId, userId) {
    const result = await this.DiaryModel.findOneAndDelete({
      _id: diaryId,
      userId
    });
    
    return !!result;
  }
}

module.exports = { DiaryService }; 