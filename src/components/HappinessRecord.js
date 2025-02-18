import React, { useState } from 'react';

const HappinessRecord = () => {
    const [happiness, setHappiness] = useState('');

    const handleChange = (e) => {
        setHappiness(e.target.value);
    };

    return (
        <div>
            <h2>幸福记录</h2>
            <input type="text" value={happiness} onChange={handleChange} placeholder="记录你的幸福时刻..." />
        </div>
    );
};

export default HappinessRecord; 