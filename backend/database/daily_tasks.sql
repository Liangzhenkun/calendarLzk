-- 任务类型表
CREATE TABLE IF NOT EXISTS task_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points_reward INT NOT NULL DEFAULT 10,
  experience_reward INT NOT NULL DEFAULT 10,
  item_reward_id INT NULL,
  icon_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 每日任务表
CREATE TABLE IF NOT EXISTS daily_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_type_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (task_type_id) REFERENCES task_types(id)
);

-- 任务历史记录表
CREATE TABLE IF NOT EXISTS task_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  action ENUM('created', 'completed', 'failed') NOT NULL,
  points_earned INT DEFAULT 0,
  experience_earned INT DEFAULT 0,
  item_reward_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (task_id) REFERENCES daily_tasks(id)
);

-- 插入一些示例任务类型
INSERT INTO task_types (name, description, points_reward, experience_reward, icon_url) VALUES
('Early Check-in', 'Check in before 6 AM', 20, 15, '/icons/early-checkin.png'),
('Write Diary', 'Record your mood and gains today', 15, 10, '/icons/diary.png'),
('Exercise', 'Exercise for more than 30 minutes', 25, 20, '/icons/exercise.png'),
('Study', 'Read or study for more than 1 hour', 30, 25, '/icons/study.png'),
('Meditation', 'Meditate for 15 minutes', 15, 10, '/icons/meditation.png'); 