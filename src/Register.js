import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // 确保创建对应的 CSS 文件

const Register = ({ onRegister, switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', { 
        username, 
        password 
      });
      onRegister();
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请稍后再试');
    }
  };

  // 输入变化时清除错误提示
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>用户注册</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={handleInputChange(setUsername)}
            placeholder="用户名"
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            placeholder="密码"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="primary-btn">立即注册</button>
          <button 
            type="button" 
            onClick={switchToLogin}
            className="secondary-btn"
          >
            已有账号？登录
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;