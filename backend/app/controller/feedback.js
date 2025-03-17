const Controller = require('egg').Controller;
const nodemailer = require('nodemailer');

class FeedbackController extends Controller {
  async submit() {
    const { ctx, app } = this;
    const { email, type, content } = ctx.request.body;
    
    // 验证输入
    if (!email || !type || !content) {
      ctx.status = 400;
      ctx.body = { message: '邮箱、类型和内容不能为空' };
      return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ctx.status = 400;
      ctx.body = { message: '邮箱格式不正确' };
      return;
    }
    
    try {
      // 创建反馈记录
      const result = await ctx.service.feedback.create({
        email,
        type,
        content,
        user_id: ctx.state.user?.id // 如果用户已登录，记录用户ID
      });
      
      // 发送邮件通知
      await this.sendFeedbackEmail(email, type, content);
      
      ctx.body = {
        success: true,
        message: '反馈提交成功',
        data: { id: result.id }
      };
    } catch (error) {
      ctx.logger.error('提交反馈失败:', error);
      ctx.status = 500;
      ctx.body = { message: '提交反馈失败，请稍后再试' };
    }
  }
  
  // 发送反馈邮件
  async sendFeedbackEmail(email, type, content) {
    const { app } = this;
    const config = app.config.email;
    
    // 获取反馈类型的文本描述
    const typeText = this.getFeedbackTypeText(type);
    
    try {
      // 创建邮件传输对象
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
      
      // 发送邮件
      await transporter.sendMail({
        from: `"日历日记系统" <${config.user}>`,
        to: 'feedback@seefu.cn', // 接收反馈的邮箱
        subject: `[用户反馈] ${typeText}`,
        html: `
          <h2>用户反馈</h2>
          <p><strong>反馈类型:</strong> ${typeText}</p>
          <p><strong>用户邮箱:</strong> ${email}</p>
          <p><strong>反馈内容:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #888; margin-top: 20px;">此邮件由系统自动发送，请勿直接回复。</p>
        `
      });
      
      this.ctx.logger.info(`反馈邮件发送成功: ${email}, 类型: ${type}`);
    } catch (error) {
      this.ctx.logger.error('发送反馈邮件失败:', error);
      // 邮件发送失败不影响反馈提交
    }
  }
  
  // 获取反馈类型的文本描述
  getFeedbackTypeText(type) {
    const typeMap = {
      feature: '功能建议',
      bug: '问题报告',
      question: '使用咨询',
      other: '其他反馈'
    };
    
    return typeMap[type] || '未知类型';
  }
}

module.exports = FeedbackController; 