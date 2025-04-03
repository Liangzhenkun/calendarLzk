USE calendar;

-- 确保表存在
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('streak', 'special', 'interaction', 'content') NOT NULL,
  icon VARCHAR(50) DEFAULT 'Medal',
  required INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 清空现有数据
TRUNCATE TABLE achievements;

-- 连续打卡成就
INSERT INTO achievements (name, description, type, icon, required) VALUES
('坚持一周', '连续写日记7天', 'streak', 'Calendar', 7),
('两周挑战', '连续写日记14天', 'streak', 'Calendar', 14),
('习惯养成', '连续写日记21天', 'streak', 'Calendar', 21),
('月度坚持', '连续写日记30天', 'streak', 'Calendar', 30),
('季度达人', '连续写日记90天', 'streak', 'Calendar', 90),
('半年成就', '连续写日记180天', 'streak', 'Calendar', 180),
('年度记录者', '连续写日记365天', 'streak', 'Calendar', 365);

-- 特殊成就
INSERT INTO achievements (name, description, type, icon, required) VALUES
('春之物语', '在春季写下10篇日记', 'special', 'Sunny', 10),
('夏之轻语', '在夏季写下10篇日记', 'special', 'Sunny', 10),
('秋之私语', '在秋季写下10篇日记', 'special', 'Sunny', 10),
('冬之絮语', '在冬季写下10篇日记', 'special', 'Sunny', 10),
('时光守护者', '记录生活一个月', 'special', 'Clock', 30),
('岁月见证者', '记录生活一年', 'special', 'Clock', 365),
('夜之诗人', '在深夜11点到凌晨5点写日记', 'special', 'Moon', 1),
('晨光笔记', '在清晨5点到7点写日记', 'special', 'Sunrise', 1),
('节日记事官', '在节假日写日记', 'special', 'Present', 1);

-- 互动成就
INSERT INTO achievements (name, description, type, icon, required) VALUES
('启程之日', '写下第一篇日记', 'interaction', 'Edit', 1),
('初识之印', '完善个人资料', 'interaction', 'User', 1),
('个性之彩', '自定义主题', 'interaction', 'Brush', 1),
('时间之约', '设置提醒', 'interaction', 'Alarm', 1);

-- 字数成就
INSERT INTO achievements (name, description, type, icon, required) VALUES
('文字启蒙', '日记累计1,000字', 'content', 'Document', 1000),
('文思泉涌', '日记累计5,000字', 'content', 'Document', 5000),
('文采飞扬', '日记累计10,000字', 'content', 'Document', 10000),
('文章大家', '日记累计50,000字', 'content', 'Document', 50000),
('文海遨游', '日记累计100,000字', 'content', 'Document', 100000),
('文学巨匠', '日记累计500,000字', 'content', 'Document', 500000),
('文之集大成', '日记累计1,000,000字', 'content', 'Document', 1000000);

-- 创建用户成就表（如果不存在）
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  current_value INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
); 