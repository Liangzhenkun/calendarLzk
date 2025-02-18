import React, { useState } from 'react';

const CheckInModule = () => {
    const [checkedIn, setCheckedIn] = useState(false);

    const handleCheckIn = () => {
        setCheckedIn(true);
        // 处理打卡逻辑
    };

    return (
        <div>
            <h2>打卡模块</h2>
            <button onClick={handleCheckIn}>{checkedIn ? '已打卡' : '打卡'}</button>
        </div>
    );
};

export default CheckInModule; 