import React from 'react';
import { Spin } from 'antd';
import './LoadingSpinner.css';

const LoadingSpinner = ({ tip = '加载中...' }) => {
  return (
    <div className="loading-container">
      <Spin tip={tip} size="large" />
    </div>
  );
};

export default LoadingSpinner; 