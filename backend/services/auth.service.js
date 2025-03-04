const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { Op } = require('sequelize');

// 密码强度验证
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`密码长度至少为 ${minLength} 个字符`);
  }
  if (!hasUpperCase) errors.push('密码必须包含大写字母');
  if (!hasLowerCase) errors.push('密码必须包含小写字母');
  if (!hasNumbers) errors.push('密码必须包含数字');
  if (!hasSpecialChars) errors.push('密码必须包含特殊字符');

  return {
    isValid: errors.length === 0,
    errors
  };
};

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET;
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    this.TOKEN_CONFIG = {
      access: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
      },
      refresh: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
      }
    };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, type: 'access' },
      this.JWT_SECRET,
      this.TOKEN_CONFIG.access
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, type: 'refresh' },
      this.JWT_SECRET,
      this.TOKEN_CONFIG.refresh
    );

    return { accessToken, refreshToken };
  }

  async login(username, password) {
    try {
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        throw new Error('用户不存在');
      }
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        throw new Error('密码错误');
      }
      
      const tokens = this.generateTokens(user);
      
      // 更新用户的 refresh token
      await user.update({ refreshToken: tokens.refreshToken });
      
      return {
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          level: user.level,
          experience: user.experience
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  async register(userData) {
    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ]
        } 
      });
      
      if (existingUser) {
        if (existingUser.username === userData.username) {
          throw new Error('用户名已存在');
        } else {
          throw new Error('邮箱已被注册');
        }
      }
      
      // 验证密码强度
      const { isValid, errors } = validatePassword(userData.password);
      if (!isValid) {
        throw new Error('密码不符合要求: ' + errors.join(', '));
      }
      
      // 加密密码
      const password_hash = await bcrypt.hash(userData.password, 10);
      
      // 创建新用户
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password_hash,
        avatar_url: userData.avatar_url
      });
      
      const tokens = this.generateTokens(user);
      
      // 保存 refresh token
      await user.update({ refreshToken: tokens.refreshToken });
      
      return {
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          level: user.level,
          experience: user.experience
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw new Error('无效的 refresh token');
      }
      
      const user = await User.findOne({
        where: {
          id: decoded.id,
          refreshToken: refreshToken
        }
      });
      
      if (!user) {
        throw new Error('refresh token 已失效');
      }
      
      const tokens = this.generateTokens(user);
      
      // 更新用户的 refresh token
      await user.update({ refreshToken: tokens.refreshToken });
      
      return {
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          level: user.level,
          experience: user.experience
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      
      if (decoded.type !== 'access') {
        throw new Error('无效的 access token');
      }
      
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new Error('用户不存在');
      }
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        level: user.level,
        experience: user.experience
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(userId) {
    try {
      await User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService(); 