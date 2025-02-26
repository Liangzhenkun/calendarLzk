import React from 'react';
import { Layout } from 'antd';
import Header from '../Header';
import ErrorBoundary from '../ErrorBoundary';
import './MainLayout.css';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout className="main-layout">
      <ErrorBoundary>
        <Header />
        <Content className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </ErrorBoundary>
    </Layout>
  );
};

export default MainLayout; 