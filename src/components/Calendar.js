import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 引入样式

const MyCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [inputValue, setInputValue] = useState('');
    const [events, setEvents] = useState({}); // 存储每一天的事件

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setInputValue(events[newDate.toDateString()] || ''); // 填充输入框
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSaveEvent = () => {
        setEvents({
            ...events,
            [date.toDateString()]: inputValue,
        });
        setInputValue(''); // 清空输入框
    };

    return (
        <div>
            <h2>日历</h2>
            <Calendar onChange={handleDateChange} value={date} />
            <div>
                <h3>输入事件</h3>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="输入事件"
                />
                <button onClick={handleSaveEvent}>保存</button>
            </div>
            <div>
                <h3>事件列表</h3>
                <ul>
                    {Object.entries(events).map(([date, event]) => (
                        <li key={date}>
                            {date}: {event}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MyCalendar; 