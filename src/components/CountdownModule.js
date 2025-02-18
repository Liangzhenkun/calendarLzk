import React, { useState, useEffect } from 'react';

const CountdownModule = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const distance = targetDate - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeLeft(`${days}天 ${hours}小时`);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div>
            <h2>重要事件倒计时</h2>
            <p>{timeLeft}</p>
        </div>
    );
};

export default CountdownModule; 