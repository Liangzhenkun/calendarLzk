-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 日记表
CREATE TABLE IF NOT EXISTS diary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    mood INT DEFAULT 3,
    weather VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引
CREATE INDEX idx_diary_user ON diary(user_id);
CREATE INDEX idx_diary_date ON diary(created_at);
CREATE INDEX idx_personal_metrics_diary ON personal_metrics(diary_id);
CREATE INDEX idx_personal_metrics_user_date ON personal_metrics(user_id, date);