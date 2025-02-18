import React from 'react';
import MyCalendar from './components/Calendar';
import DiaryTemplate from './components/DiaryTemplate';
import CheckInModule from './components/CheckInModule';
import CountdownModule from './components/CountdownModule';
import HappinessRecord from './components/HappinessRecord';
import HolidayReminder from './components/HolidayReminder';

const App = () => {
    const holidays = ['春节', '国庆节', '中秋节'];

    return (
        <div>
            <h1>日历打卡应用</h1>
            <MyCalendar />
            <DiaryTemplate />
            <CheckInModule />
            <CountdownModule targetDate={new Date('2023-12-31')} />
            <HappinessRecord />
            <HolidayReminder holidays={holidays} />
        </div>
    );
};

export default App; 