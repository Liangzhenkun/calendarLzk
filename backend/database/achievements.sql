-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT '成就类型：streak(连续打卡), special(特殊成就), interaction(互动成就), content(字数成就)',
  required INT NOT NULL,
  points_reward INT NOT NULL DEFAULT 10,
  experience_reward INT NOT NULL DEFAULT 10,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  current_value INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入连续打卡成就
INSERT INTO achievements (id, name, description, type, required, points_reward, experience_reward, icon) VALUES
(1, '启程之日', '完成第一次日记记录', 'streak', 1, 10, 5, 'Calendar'),
(2, '初心萌动', '连续记录3天', 'streak', 3, 30, 15, 'Star'),
(3, '坚持之芽', '连续记录7天', 'streak', 7, 70, 35, 'Check'),
(4, '习惯养成', '连续记录14天（激活容错机制）', 'streak', 14, 140, 70, 'Trophy'),
(5, '月光守护者', '连续记录1个月', 'streak', 30, 300, 150, 'Moon'),
(6, '双月物语', '连续记录2个月', 'streak', 60, 600, 300, 'MoonNight'),
(7, '春分之约', '连续记录3个月', 'streak', 90, 900, 450, 'Sunrise'),
(8, '四月物语', '连续记录4个月', 'streak', 120, 1200, 600, 'Sunny'),
(9, '五月之誓', '连续记录5个月', 'streak', 150, 1500, 750, 'Sunny'),
(10, '半年之约', '连续记录6个月', 'streak', 180, 1800, 900, 'Sunny'),
(11, '七月之契', '连续记录7个月', 'streak', 210, 2100, 1050, 'Sunny'),
(12, '八月之心', '连续记录8个月', 'streak', 240, 2400, 1200, 'Sunny'),
(13, '九月之旅', '连续记录9个月', 'streak', 270, 2700, 1350, 'Sunny'),
(14, '十月之志', '连续记录10个月', 'streak', 300, 3000, 1500, 'Sunny'),
(15, '十一月之约', '连续记录11个月', 'streak', 330, 3300, 1650, 'Sunny'),
(16, '岁末之誓', '连续记录12个月', 'streak', 365, 3650, 1825, 'Sunny');

-- 插入特殊成就
INSERT INTO achievements (id, name, description, type, required, points_reward, experience_reward, icon) VALUES
(17, '春之物语', '完成春季（3个月）连续记录', 'special', 90, 900, 450, 'Cherry'),
(18, '夏之轻语', '完成夏季（6个月）连续记录', 'special', 180, 1800, 900, 'Sunny'),
(19, '秋之私语', '完成秋季（9个月）连续记录', 'special', 270, 2700, 1350, 'Leaf'),
(20, '冬之絮语', '完成冬季（12个月）连续记录', 'special', 365, 3650, 1825, 'Snowflake'),
(21, '时光守护者', '完成半年连续记录', 'special', 180, 1800, 900, 'Timer'),
(22, '岁月见证者', '完成一年连续记录', 'special', 365, 3650, 1825, 'Calendar'),
(23, '夜之诗人', '在深夜（23:00-次日5:00）完成记录', 'special', 1, 100, 50, 'Moon'),
(24, '晨光笔记', '在清晨（5:00-7:00）完成记录', 'special', 1, 100, 50, 'Sunrise'),
(25, '节日记事官', '在节日当天完成记录', 'special', 1, 100, 50, 'Present');

-- 插入互动成就
INSERT INTO achievements (id, name, description, type, required, points_reward, experience_reward, icon) VALUES
(26, '破茧之笔', '完成第一次日记记录', 'interaction', 1, 10, 5, 'EditPen'),
(27, '初识之印', '完善个人资料', 'interaction', 1, 10, 5, 'User'),
(28, '个性之彩', '自定义主题', 'interaction', 1, 10, 5, 'Brush'),
(29, '时间之约', '设置提醒', 'interaction', 1, 10, 5, 'Bell');

-- 插入字数成就
INSERT INTO achievements (id, name, description, type, required, points_reward, experience_reward, icon) VALUES
(30, '初露锋芒', '累计写作100字', 'content', 100, 10, 5, 'Edit'),
(31, '笔耕不辍', '累计写作500字', 'content', 500, 50, 25, 'Edit'),
(32, '文思泉涌', '累计写作1000字', 'content', 1000, 100, 50, 'Edit'),
(33, '妙笔生花', '累计写作2000字', 'content', 2000, 200, 100, 'Edit'),
(34, '笔走龙蛇', '累计写作5000字', 'content', 5000, 500, 250, 'Edit'),
(35, '文采斐然', '累计写作1万字', 'content', 10000, 1000, 500, 'Edit'),
(36, '著作等身', '累计写作5万字', 'content', 50000, 5000, 2500, 'Edit'),
(37, '文坛巨匠', '累计写作10万字', 'content', 100000, 10000, 5000, 'Edit'); 