const initDatabase = require('./database');
const initAchievements = require('./init-achievements');

module.exports = async app => {
  try {
    await initDatabase(app);
    await initAchievements(app);
  } catch (error) {
    app.logger.error('初始化失败:', error);
    throw error;
  }
}; 