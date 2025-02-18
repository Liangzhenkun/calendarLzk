import React from 'react';
import { Calendar } from 'antd'; // 使用 Ant Design 的日历组件

const MyCalendar = () => {
    const onSelect = (date) => {
        console.log(date.format('YYYY-MM-DD'));
        // 处理日期选择
    };

    return (
        <Calendar onSelect={onSelect} />
    );
};

export default MyCalendar; 