import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 引入样式
import Modal from 'react-modal';
import './Calendar.css'; // 引入自定义样式

const MyCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState({}); // 存储每一天的事件
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [eventInput, setEventInput] = useState('');

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };

    const openModal = (newDate) => {
        console.log("双击日期:", newDate); // 添加日志以调试
        const dayString = newDate.toDateString();
        setSelectedDate(dayString);
        setEventInput(events[dayString] || '');
        setIsModalOpen(true); // 双击后打开模态框
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const saveEvent = () => {
        setEvents({
            ...events,
            [selectedDate]: eventInput,
        });
        closeModal();
    };

    return (
        <div className="calendar-container">
            <h2>日历</h2>
            <Calendar 
                onChange={handleDateChange} 
                value={date} 
                onDoubleClickDay={openModal} // 确保双击事件
                className="custom-calendar" // 添加自定义类名
            />

            {/* 模态框 */}
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} ariaHideApp={false}>
                <h2>{selectedDate}</h2>
                <input
                    type="text"
                    value={eventInput}
                    onChange={(e) => setEventInput(e.target.value)}
                    placeholder="输入事件"
                    style={{ width: '100%', marginTop: '5px' }}
                />
                <button onClick={saveEvent} style={{ marginTop: '5px' }}>保存</button>
                <button onClick={closeModal} style={{ marginTop: '5px' }}>关闭</button>
            </Modal>
        </div>
    );
};

export default MyCalendar; 