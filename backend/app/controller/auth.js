const Controller = require('egg').Controller;

class AuthController extends Controller {
  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    try {
      ctx.logger.info('用户尝试登录:', { username });
      
      // 验证请求参数
      if (!username || !password) {
        ctx.logger.warn('登录参数无效:', { username: !!username, password: !!password });
        ctx.body = {
          code: 1,
          message: '用户名和密码不能为空',
          data: null
        };
        return;
      }

      // 调用 service 进行登录
      try {
        const result = await ctx.service.auth.login(username, password);
        ctx.logger.info('登录成功，返回数据:', {
          code: result.code,
          message: result.message,
          hasData: !!result.data,
          hasToken: result.data && !!result.data.accessToken
        });
        ctx.body = result;
      } catch (serviceError) {
        ctx.logger.error('登录服务发生错误:', serviceError);
        ctx.body = {
          code: 1,
          message: serviceError.message || '登录失败',
          data: null
        };
      }
    } catch (error) {
      ctx.logger.error('登录控制器发生错误:', error);
      ctx.body = {
        code: 1,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  async register() {
    const { ctx } = this;
    const userData = ctx.request.body;

    try {
      // 验证请求参数
      if (!userData.username || !userData.password || !userData.email) {
        ctx.body = {
          code: 1,
          message: '用户名、密码和邮箱不能为空',
          data: null
        };
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        ctx.body = {
          code: 1,
          message: '邮箱格式不正确',
          data: null
        };
        return;
      }

      ctx.logger.info('用户尝试注册:', { username: userData.username, email: userData.email });
      const result = await ctx.service.auth.register(userData);
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('注册失败:', error);
      ctx.body = {
        code: 1,
        message: error.message || '注册失败',
        data: null
      };
    }
  }

  async logout() {
    const { ctx } = this;
    try {
      ctx.body = {
        code: 0,
        message: '退出成功',
        data: null
      };
    } catch (error) {
      ctx.logger.error('退出失败:', error);
      ctx.body = {
        code: 1,
        message: '退出失败',
        data: null
      };
    }
  }
}

module.exports = AuthController; 