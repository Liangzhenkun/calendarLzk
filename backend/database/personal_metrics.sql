CREATE TABLE IF NOT EXISTS `personal_metrics` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `diary_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `sleep_quality` INT DEFAULT 5 COMMENT '睡眠质量 1-10',
  `stress_level` INT DEFAULT 5 COMMENT '压力水平 1-10',
  `productivity` INT DEFAULT 5 COMMENT '工作效率 1-10',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`, `date`),
  KEY `idx_diary_id` (`diary_id`),
  CONSTRAINT `fk_metrics_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_metrics_diary` FOREIGN KEY (`diary_id`) REFERENCES `diary` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;