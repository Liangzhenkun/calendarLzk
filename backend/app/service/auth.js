const Service = require('egg').Service;

class AuthService extends Service {
  async login(username, password) {
    const { ctx, app } = this;
    
    // 查找用户
    const user = await ctx.service.user.findOne({ username });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isValid = await ctx.service.user.comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('密码错误');
    }

    // 生成 token
    const token = app.jwt.sign({
      id: user.id,
      username: user.username
    }, app.config.jwt.secret);

    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }

  async register(userData) {
    const { ctx } = this;
    const { username, password } = userData;

    // 检查用户是否已存在
    const existingUser = await ctx.service.user.findOne({ username });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 创建新用户
    const userId = await ctx.service.user.create({ username, password });
    const user = await ctx.service.user.findOne({ username });

    return {
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username
      }
    };
  }
}

module.exports = AuthService; 