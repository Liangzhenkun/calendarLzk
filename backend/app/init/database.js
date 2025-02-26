const initDatabase = async (app) => {
  const mysql = app.mysql;
  
  try {
    // 创建用户表
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS User (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建日历记录表
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS CalendarRecord (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        date DATE NOT NULL,
        content TEXT,
        mood VARCHAR(20),
        tags VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id),
        UNIQUE KEY unique_user_date (userId, date)
      )
    `);

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = initDatabase; 