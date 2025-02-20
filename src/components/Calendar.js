import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = () => {
    const [records, setRecords] = useState({});
    const [content, setContent] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const userId = 'your_user_id'; // 替换为实际用户 ID

    const handleSave = async (date) => {
        try {
            await axios.post('/api/calendar/record', { userId, date, content });
            setRecords((prev) => ({ ...prev, [date]: content }));
            setContent('');
        } catch (error) {
            console.error('保存记录失败:', error);
        }
    };

    const handleDateClick = async (date) => {
        try {
            const response = await axios.get(`/api/calendar/record/${userId}/${date}`);
            alert(`记录内容: ${response.data.content}`);
        } catch (error) {
            console.error('获取记录失败:', error);
        }
    };

    // 假设您有一个函数来生成日历
    const renderCalendar = () => {
        const daysInMonth = 30; // 示例，您可以根据实际情况生成
        const calendar = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = `2023-09-${i < 10 ? '0' + i : i}`; // 示例日期格式
            calendar.push(
                <div key={date} onClick={() => handleDateClick(date)} style={{ border: '1px solid', padding: '10px', margin: '5px' }}>
                    {date} {records[date] && <span>✔️</span>}
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="输入记录"
                    />
                    <button onClick={() => handleSave(date)}>打卡</button>
                </div>
            );
        }
        return calendar;
    };

    return <div>{renderCalendar()}</div>;
};

export default Calendar; 