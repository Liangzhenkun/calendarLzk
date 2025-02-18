import React, { useState } from 'react';

const DiaryTemplate = () => {
    const [diaryEntry, setDiaryEntry] = useState('');

    const handleChange = (e) => {
        setDiaryEntry(e.target.value);
    };

    return (
        <div>
            <h2>日记模板</h2>
            <textarea value={diaryEntry} onChange={handleChange} placeholder="写下你的日记..." />
        </div>
    );
};

export default DiaryTemplate; 