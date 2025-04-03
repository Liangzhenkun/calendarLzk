/**
 * 手动初始化成就数据
 * 使用方法：node scripts/init-achievements.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, `../.env.${env}`);
dotenv.config({ path: envPath });

// 创建数据库连接
const connectDB = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'calendar',
  });
};

// 初始化成就数据
const initAchievements = async () => {
  const connection = await connectDB();
  try {
    console.log('开始初始化成就数据...');

    // 确保achievements表存在
    await connection.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('streak', 'special', 'interaction', 'content') NOT NULL,
        icon VARCHAR(50) DEFAULT 'Medal',
        required INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 确保user_achievements表存在
    await connection.query(`
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
      )
    `);

    // 清空现有成就数据
    console.log('清空现有成就数据...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE user_achievements');
    await connection.query('TRUNCATE TABLE achievements');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('插入第一个成就 - 启程之日...');
    // 第一个成就 - 启程之日（放在第一页）
    await connection.query(`
      INSERT INTO achievements (name, description, type, required_value, points_reward, experience_reward, icon_url) VALUES
      ('启程之日', '写下第一篇日记', 'streak', 1, 5, 5, 'Edit')
    `);

    console.log('插入连续打卡成就...');
    // 连续打卡成就
    await connection.query(`
      INSERT INTO achievements (name, description, type, required_value, points_reward, experience_reward, icon_url) VALUES
      ('坚持一周', '连续写日记7天', 'streak', 7, 10, 10, 'Calendar'),
      ('两周挑战', '连续写日记14天', 'streak', 14, 20, 20, 'Calendar'),
      ('习惯养成', '连续写日记21天', 'streak', 21, 30, 30, 'Calendar'),
      ('月度坚持', '连续写日记30天', 'streak', 30, 40, 40, 'Calendar'),
      ('季度达人', '连续写日记90天', 'streak', 90, 50, 50, 'Calendar'),
      ('半年成就', '连续写日记180天', 'streak', 180, 100, 100, 'Calendar'),
      ('年度记录者', '连续写日记365天', 'streak', 365, 200, 200, 'Calendar')
    `);

    console.log('插入特殊成就...');
    // 特殊成就
    await connection.query(`
      INSERT INTO achievements (name, description, type, required_value, points_reward, experience_reward, icon_url) VALUES
      ('春之物语', '在春季写下10篇日记', 'special', 10, 20, 20, 'Sunny'),
      ('夏之轻语', '在夏季写下10篇日记', 'special', 10, 20, 20, 'Sunny'),
      ('秋之私语', '在秋季写下10篇日记', 'special', 10, 20, 20, 'Sunny'),
      ('冬之絮语', '在冬季写下10篇日记', 'special', 10, 20, 20, 'Sunny'),
      ('时光守护者', '记录生活一个月', 'special', 30, 30, 30, 'Clock'),
      ('岁月见证者', '记录生活一年', 'special', 365, 100, 100, 'Clock'),
      ('夜之诗人', '在深夜11点到凌晨5点写日记', 'special', 1, 10, 10, 'Moon'),
      ('晨光笔记', '在清晨5点到7点写日记', 'special', 1, 10, 10, 'Sunrise'),
      ('节日记事官', '在节假日写日记', 'special', 1, 10, 10, 'Present')
    `);

    console.log('插入互动成就...');
    // 互动成就（删除了启程之日）
    await connection.query(`
      INSERT INTO achievements (name, description, type, required_value, points_reward, experience_reward, icon_url) VALUES
      ('初识之印', '完善个人资料', 'interaction', 1, 5, 5, 'User'),
      ('个性之彩', '自定义主题', 'interaction', 1, 5, 5, 'Brush'),
      ('时间之约', '设置提醒', 'interaction', 1, 5, 5, 'Alarm')
    `);

    console.log('插入字数成就...');
    // 字数成就
    await connection.query(`
      INSERT INTO achievements (name, description, type, required_value, points_reward, experience_reward, icon_url) VALUES
      ('文字启蒙', '日记累计1,000字', 'content', 1000, 10, 10, 'Document'),
      ('文思泉涌', '日记累计5,000字', 'content', 5000, 20, 20, 'Document'),
      ('文采飞扬', '日记累计10,000字', 'content', 10000, 30, 30, 'Document'),
      ('文章大家', '日记累计50,000字', 'content', 50000, 50, 50, 'Document'),
      ('文海遨游', '日记累计100,000字', 'content', 100000, 100, 100, 'Document'),
      ('文学巨匠', '日记累计500,000字', 'content', 500000, 200, 200, 'Document'),
      ('文之集大成', '日记累计1,000,000字', 'content', 1000000, 500, 500, 'Document')
    `);

    console.log('成就数据初始化成功！');
  } catch (error) {
    console.error('初始化成就数据失败:', error);
  } finally {
    await connection.end();
  }
};

// 执行初始化
initAchievements(); 