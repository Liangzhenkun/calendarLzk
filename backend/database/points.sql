-- 积分历史表
CREATE TABLE IF NOT EXISTS points_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  points INT NOT NULL,
  type ENUM('earned', 'spent') NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 为用户表添加积分字段（如果不存在）
ALTER TABLE user ADD COLUMN IF NOT EXISTS points INT DEFAULT 0; 