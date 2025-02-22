import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', { username, password });
      alert('注册成功');
    } catch (error) {
      console.error('注册失败:', error);
      setErrorMessage('注册失败，请稍后再试。');
    }
  };

  return (
    <div>
      <h2>注册</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">注册</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <p style={{ color: 'gray' }}>
        密码要求：至少8个字符，包含字母和数字。
      </p>
    </div>
  );
};

export default Register;