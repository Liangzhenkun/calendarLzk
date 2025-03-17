const Service = require('egg').Service;

class AuthService extends Service {
  async login(username, password) {
    const { ctx, app } = this;
    
    try {
      // 查找用户
      ctx.logger.info('开始查找用户:', { username });
      const user = await ctx.service.user.findOne({ username });
      
      if (!user) {
        ctx.logger.warn('用户不存在:', { username });
        throw new Error('用户不存在');
      }

      ctx.logger.info('用户查找成功:', { 
        id: user.id,
        username: user.username,
        hasPasswordHash: !!user.password_hash
      });

      // 验证密码
      try {
        const isValid = await ctx.service.user.comparePassword(password, user.password_hash);
        ctx.logger.info('密码验证结果:', { isValid });
        
        if (!isValid) {
          throw new Error('密码错误');
        }
      } catch (passwordError) {
        ctx.logger.error('密码验证失败:', passwordError);
        throw new Error('密码验证失败');
      }

      // 生成 token
      try {
        const accessToken = app.jwt.sign(
          { id: user.id, username: user.username },
          app.config.jwt.secret,
          { expiresIn: '24h' }
        );

        const refreshToken = app.jwt.sign(
          { id: user.id, username: user.username, type: 'refresh' },
          app.config.jwt.secret,
          { expiresIn: '7d' }
        );

        ctx.logger.info('Token 生成成功:', { 
          userId: user.id,
          accessTokenLength: accessToken.length,
          refreshTokenLength: refreshToken.length
        });

        return {
          code: 0,
          message: '登录成功',
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar_url: user.avatar_url,
              experience: user.experience,
              level: user.level
            }
          }
        };
      } catch (tokenError) {
        ctx.logger.error('Token 生成失败:', tokenError);
        throw new Error('Token 生成失败');
      }
    } catch (error) {
      ctx.logger.error('登录过程中发生错误:', error);
      throw error;
    }
  }

  async register(userData) {
    const { ctx } = this;
    const { username, password, email } = userData;

    try {
      // 检查用户名是否存在
      const existingUser = await ctx.service.user.findOne({ username });

      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 创建用户
      const userId = await ctx.service.user.create({
        username,
        password,
        email
      });

      // 生成 token
      const accessToken = this.app.jwt.sign(
        { id: userId, username },
        this.app.config.jwt.secret,
        { expiresIn: '24h' }
      );

      // 生成 refresh token
      const refreshToken = this.app.jwt.sign(
        { id: userId, username, type: 'refresh' },
        this.app.config.jwt.secret,
        { expiresIn: '7d' }
      );

      return {
        code: 0,
        message: '注册成功',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: userId,
            username,
            email,
            avatar_url: null,
            experience: 0,
            level: 1
          }
        }
      };
    } catch (error) {
      ctx.logger.error('注册过程中发生错误:', error);
      throw error;
    }
  }
}

module.exports = AuthService; 