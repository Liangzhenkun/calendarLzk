import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import Calendar from './features/calendar/components/Calendar';
import DiaryTemplate from './features/diary/components/DiaryTemplate';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const HomeRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/calendar" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router basename="/clanderLzk">
      <AuthProvider>
        <MainLayout>
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
            <Route
              path="/diary"
              element={
                <PrivateRoute>
                  <DiaryTemplate />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<HomeRoute />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App; 