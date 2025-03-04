const { Sequelize } = require('sequelize');
const schemas = require('../database/schema');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'calendar',
  logging: false,
  define: {
    timestamps: true,
    underscored: false
  }
});

const models = {};

// 初始化模型
Object.entries(schemas).forEach(([name, schema]) => {
  models[name] = sequelize.define(name, schema.attributes, {
    tableName: schema.tableName,
    timestamps: true
  });
});

// 设置模型关联
models.Diary.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'user'
});

models.CalendarRecord.belongsTo(models.User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  ...models
}; 