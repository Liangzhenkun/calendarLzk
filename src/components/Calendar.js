import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 引入样式
import Modal from 'react-modal';
import { api } from '../services/api';
import './Calendar.css'; // 引入自定义样式

const MyCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState({}); // 存储每一天的事件
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [eventInput, setEventInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 获取事件数据
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const records = await api.calendar.getRecords();
                const newEvents = {};
                records.forEach(record => {
                    if (record.date && record.content) {
                        const dateStr = new Date(record.date).toDateString();
                        newEvents[dateStr] = record.content;
                    }
                });
                setEvents(newEvents);
            } catch (error) {
                console.error('获取事件失败:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [date]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setEventInput(events[newDate.toDateString()] || '');
    };

    const openModal = (newDate) => {
        const dayString = newDate.toDateString();
        setSelectedDate(dayString);
        setEventInput(events[dayString] || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const saveEvent = async () => {
        try {
            const userInfo = localStorage.getItem('user_info');
            if (!userInfo) {
                throw new Error('用户未登录');
            }
            const { id: userId } = JSON.parse(userInfo);
            
            await api.calendar.createOrUpdate({
                userId,
                date: date.toISOString().split('T')[0],
                content: eventInput
            });

            setEvents(prev => ({
                ...prev,
                [selectedDate]: eventInput
            }));
            closeModal();
        } catch (error) {
            console.error('保存事件失败:', error);
            alert(error.message || '保存失败，请重试');
        }
    };

    if (loading) {
        return <div className="calendar-container">加载中...</div>;
    }

    return (
        <div className="calendar-container">
            <h2>日历</h2>
            {error && <div className="error-message">{error}</div>}
            <Calendar 
                onChange={handleDateChange} 
                value={date} 
                onClickDay={openModal}
                className="custom-calendar"
                tileContent={({ date }) => {
                    const hasEvent = events[date.toDateString()];
                    return hasEvent ? <div className="event-dot"></div> : null;
                }}
            />

            <Modal 
                isOpen={isModalOpen} 
                onRequestClose={closeModal} 
                ariaHideApp={false}
                className="modal"
                overlayClassName="overlay"
            >
                <h2>{selectedDate}</h2>
                <textarea
                    value={eventInput}
                    onChange={(e) => setEventInput(e.target.value)}
                    placeholder="输入事件"
                    className="event-input"
                />
                <div className="modal-buttons">
                    <button onClick={saveEvent}>保存</button>
                    <button onClick={closeModal}>关闭</button>
                </div>
            </Modal>
        </div>
    );
};

export default MyCalendar; 