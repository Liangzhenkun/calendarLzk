module.exports = () => {
  return async function auth(ctx, next) {
    const token = ctx.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      ctx.status = 401;
      ctx.body = { message: '未提供认证令牌' };
      return;
    }

    try {
      const decoded = ctx.app.jwt.verify(token, ctx.app.config.jwt.secret);
      ctx.state.user = decoded;
      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = { message: '无效的认证令牌' };
    }
  };
}; 