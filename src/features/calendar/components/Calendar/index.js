import React, { useState, useEffect } from 'react';
import { Calendar as AntCalendar, Card, message } from 'antd';
import { api } from '../../../../services/api';
import './Calendar.css';

const Calendar = () => {
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 添加一个小延迟，确保token已经设置好
    const timer = setTimeout(() => {
      fetchRecords();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.calendar.getRecords();
      
      // 如果返回的是数组，则处理数据
      if (Array.isArray(data)) {
        const recordMap = {};
        data.forEach(record => {
          if (record && record.date) {
            recordMap[record.date] = record;
          }
        });
        setRecords(recordMap);
      } else {
        // 如果返回的不是数组，设置为空对象（新用户情况）
        setRecords({});
      }
    } catch (error) {
      console.error('获取记录失败:', error);
      // 只有在非404错误时才显示错误提示
      if (!error.message.includes('404') && !error.message.includes('获取记录失败')) {
        message.error('获取记录失败');
      }
      // 设置空记录
      setRecords({});
    } finally {
      setLoading(false);
    }
  };

  const dateCellRender = (date) => {
    if (!date) return null;
    
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const record = records[dateStr];
      if (record) {
        return (
          <div className={`calendar-cell mood-${record.mood}`}>
            <div className="calendar-cell-content">
              {record.content && <div className="calendar-cell-text">{record.content}</div>}
              {record.tags && <div className="calendar-cell-tags">{record.tags}</div>}
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('渲染日期单元格失败:', error);
    }
    return null;
  };

  return (
    <Card title="我的日历" className="calendar-card">
      <AntCalendar
        dateCellRender={dateCellRender}
        loading={loading}
      />
    </Card>
  );
};

export default Calendar; 