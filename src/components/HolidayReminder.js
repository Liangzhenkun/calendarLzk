import React from 'react';

const HolidayReminder = ({ holidays }) => {
    // 确保 holidays 是一个数组
    if (!Array.isArray(holidays)) {
        return <div>没有节日提醒</div>; // 或者返回一个默认的 UI
    }

    return (
        <div>
            <h2>节日提醒</h2>
            <ul>
                {holidays.map((holiday, index) => (
                    <li key={index}>{holiday}</li>
                ))}
            </ul>
        </div>
    );
};

export default HolidayReminder; 