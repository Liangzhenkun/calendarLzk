import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <AntHeader className="header">
      <div className="logo" onClick={() => navigate('/')}>我的日历</div>
      <Menu theme="light" mode="horizontal" className="menu">
        {isAuthenticated ? (
          <>
            <Menu.Item key="calendar" onClick={() => navigate('/calendar')}>
              日历
            </Menu.Item>
            <Menu.Item key="diary" onClick={() => navigate('/diary')}>
              写日记
            </Menu.Item>
            <Menu.Item key="logout">
              <Button type="link" onClick={logout}>
                退出
              </Button>
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="login" onClick={() => navigate('/login')}>
              登录
            </Menu.Item>
            <Menu.Item key="register" onClick={() => navigate('/register')}>
              注册
            </Menu.Item>
          </>
        )}
      </Menu>
    </AntHeader>
  );
};

export default Header; 