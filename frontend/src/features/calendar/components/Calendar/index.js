import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from 'react-modal';
import { api } from '../../../../services/api';
import './Calendar.css';

const MyCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [eventInput, setEventInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

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
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (date) => {
        setSelectedDate(date.toDateString());
        setEventInput(events[date.toDateString()] || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEventInput('');
    };

    const saveEvent = async () => {
        try {
            await api.calendar.createOrUpdate({
                date: selectedDate,
                content: eventInput
            });
            setEvents(prev => ({
                ...prev,
                [selectedDate]: eventInput
            }));
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <div>加载中...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="calendar-container">
            <h2>日历</h2>
            <Calendar
                onChange={setDate}
                value={date}
                onClickDay={handleDateClick}
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