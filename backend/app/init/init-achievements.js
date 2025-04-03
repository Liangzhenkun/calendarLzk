const initAchievements = async (app) => {
  const mysql = app.mysql;
  
  try {
    // 创建成就表
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        required_value INT NOT NULL,
        points_reward INT NOT NULL DEFAULT 10,
        experience_reward INT NOT NULL DEFAULT 10,
        icon_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建用户成就表
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        current_value INT DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id)
      )
    `);

    // 检查是否已经有成就记录
    const existingAchievements = await mysql.query('SELECT COUNT(*) as count FROM achievements');
    if (existingAchievements[0].count > 0) {
      console.log('成就数据已存在，跳过初始化');
      return;
    }

    // 初始化基础成就
    const baseAchievements = [
      {
        name: '启程之日',
        description: '写下你的第一篇日记',
        type: 'interaction',
        required_value: 1,
        points_reward: 10,
        experience_reward: 10
      },
      {
        name: '坚持不懈',
        description: '连续写日记 3 天',
        type: 'streak',
        required_value: 3,
        points_reward: 20,
        experience_reward: 20
      },
      {
        name: '持之以恒',
        description: '连续写日记 7 天',
        type: 'streak',
        required_value: 7,
        points_reward: 30,
        experience_reward: 30
      },
      {
        name: '情绪记录者',
        description: '记录所有不同的心情',
        type: 'interaction',
        required_value: 5,
        points_reward: 20,
        experience_reward: 20
      },
      {
        name: '天气观察员',
        description: '记录所有不同的天气',
        type: 'interaction',
        required_value: 5,
        points_reward: 20,
        experience_reward: 20
      }
    ];

    // 批量插入成就
    for (const achievement of baseAchievements) {
      await mysql.insert('achievements', achievement);
    }

    console.log('成就数据初始化成功');
  } catch (error) {
    console.error('成就数据初始化失败:', error);
    throw error;
  }
};

module.exports = initAchievements; 