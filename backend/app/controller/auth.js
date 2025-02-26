const { Controller } = require('egg');

class AuthController extends Controller {
  async login() {
    const { ctx, service } = this;
    const { username, password } = ctx.request.body;

    try {
      const result = await service.auth.login(username, password);
      ctx.body = result;
    } catch (error) {
      ctx.status = 401;
      ctx.body = { message: error.message };
    }
  }

  async register() {
    const { ctx, service } = this;
    const userData = ctx.request.body;

    try {
      const result = await service.auth.register(userData);
      ctx.body = result;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { message: error.message };
    }
  }
}

module.exports = AuthController; 