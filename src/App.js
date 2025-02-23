import React, { useState } from 'react';
import MyCalendar from './components/Calendar';
import DiaryTemplate from './components/DiaryTemplate';
import CheckInModule from './components/CheckInModule';
import CountdownModule from './components/CountdownModule';
import HappinessRecord from './components/HappinessRecord'; 
import HolidayReminder from './components/HolidayReminder';
import Login from './Login';
import Register from './Register';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const holidays = ['春节', '国庆节', '中秋节'];  

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <div>
            {!isLoggedIn ? (
                <div>
                    {showRegister ? (
                        <Register />
                    ) : (
                        <Login onLogin={handleLogin} />
                    )}
                    <button onClick={() => setShowRegister(!showRegister)}>
                        {showRegister ? '已有账号？登录' : '没有账号？注册'}
                    </button>
                </div>
            ) : (
                <MyCalendar />
            )}
            <DiaryTemplate />
            <CheckInModule />
            <CountdownModule />
            <HappinessRecord />
            <ErrorBoundary>
                <HolidayReminder holidays={holidays} />
            </ErrorBoundary>
        </div>
    );
};

export default App; 