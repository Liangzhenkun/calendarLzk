import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider } from './features/auth/context/AuthContext';
import Header from './components/layout/Header';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import Calendar from './features/calendar/components/Calendar';
import PrivateRoute from './components/PrivateRoute';

const { Content } = Layout;

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Header />
          <Content>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <Calendar />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/calendar" replace />} />
            </Routes>
          </Content>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App; 