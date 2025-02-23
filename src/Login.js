import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { username, password });
      alert('登录成功');
      onLogin();
    } catch (error) {
      console.error('登录失败:', error);
      setErrorMessage('用户名或密码错误');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', { username: registerUsername, password: registerPassword });
      alert('注册成功');
      setIsRegisterModalOpen(false);
      setRegisterUsername('');
      setRegisterPassword('');
    } catch (error) {
      console.error('注册失败:', error);
      const message = error.response ? error.response.data.message : '注册失败，请稍后再试。';
      setErrorMessage(message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>登录</h2>
      <form onSubmit={handleLogin} style={{ width: '300px' }}>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
        />
        <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#1890ff', color: 'white', cursor: 'pointer', width: '100%' }}>登录</button>
      </form>
      <p style={{ color: 'gray' }}>
        没有账户？ <button onClick={() => setIsRegisterModalOpen(true)} style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#40a9ff', color: 'white', cursor: 'pointer', width: '100%' }}>点击注册</button>
      </p>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <Modal isOpen={isRegisterModalOpen} onRequestClose={() => setIsRegisterModalOpen(false)} ariaHideApp={false}>
        <h3>注册</h3>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="用户名"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
            style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="password"
            placeholder="密码"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
            style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#40a9ff', color: 'white', cursor: 'pointer', width: '100%' }}>注册</button>
        </form>
        <button onClick={() => setIsRegisterModalOpen(false)} style={{ marginTop: '10px', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#ff4d4f', color: 'white', cursor: 'pointer', width: '100%' }}>关闭</button>
      </Modal>
    </div>
  );
};

export default Login;