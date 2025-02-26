const { Controller } = require('egg');

class AuthController extends Controller {
  async login() {
    const { ctx, service } = this;
    const { username, password } = ctx.request.body;

    ctx.logger.info('用户尝试登录:', { username });

    try {
      const result = await service.auth.login(username, password);
      ctx.logger.info('用户登录成功:', { username });
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('用户登录失败:', { username, error: error.message });
      ctx.status = 401;
      ctx.body = { message: error.message };
    }
  }

  async register() {
    const { ctx, service } = this;
    const userData = ctx.request.body;

    ctx.logger.info('用户尝试注册:', { username: userData.username });

    try {
      const result = await service.auth.register(userData);
      ctx.logger.info('用户注册成功:', { username: userData.username });
      ctx.body = result;
    } catch (error) {
      ctx.logger.error('用户注册失败:', { username: userData.username, error: error.message });
      ctx.status = 400;
      ctx.body = { message: error.message };
    }
  }
}

module.exports = AuthController; 