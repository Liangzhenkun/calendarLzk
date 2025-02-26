const Service = require('egg').Service;
const bcrypt = require('bcryptjs');

class AuthService extends Service {
  async login(username, password) {
    const user = await this.app.mysql.get('User', { username });
    if (!user) {
      throw new Error('用户不存在');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('密码错误');
    }

    const token = this.app.jwt.sign(
      { id: user.id, username: user.username },
      this.app.config.jwt.secret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }

  async register(userData) {
    const { username, password } = userData;

    // 检查用户是否已存在
    const existingUser = await this.app.mysql.get('User', { username });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const result = await this.app.mysql.insert('User', {
      username,
      password: hashedPassword
    });

    return {
      id: result.insertId,
      username
    };
  }
}

module.exports = AuthService; 