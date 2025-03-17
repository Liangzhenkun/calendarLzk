-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    refresh_token TEXT,
    experience INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 日记表
CREATE TABLE IF NOT EXISTS diary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    content TEXT,
    mood INT DEFAULT 3,
    weather VARCHAR(20),
    type VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 日记标签表
CREATE TABLE IF NOT EXISTS diary_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    diary_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diary_id) REFERENCES diary(id) ON DELETE CASCADE
);

-- 个性化指标表
CREATE TABLE IF NOT EXISTS personal_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    diary_id INT NOT NULL,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    sleep_quality INT DEFAULT 5,
    energy_level INT DEFAULT 5,
    stress_level INT DEFAULT 5,
    productivity INT DEFAULT 5,
    mood_score INT DEFAULT 5,
    social_satisfaction INT DEFAULT 5,
    family_index INT DEFAULT 5,
    health_score INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (diary_id) REFERENCES diary(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 创建索引
CREATE INDEX idx_diary_date ON diary(date);
CREATE INDEX idx_diary_user_date ON diary(user_id, date);
CREATE INDEX idx_diary_tags_diary ON diary_tags(diary_id);
CREATE INDEX idx_personal_metrics_diary ON personal_metrics(diary_id);
CREATE INDEX idx_personal_metrics_user_date ON personal_metrics(user_id, date);