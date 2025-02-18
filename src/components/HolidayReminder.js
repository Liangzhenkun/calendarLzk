import React from 'react';

const HolidayReminder = ({ holidays }) => {
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