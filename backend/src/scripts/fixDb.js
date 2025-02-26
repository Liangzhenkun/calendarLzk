require('dotenv').config();
const mysql = require('mysql2/promise');

const fixDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('开始修复数据库...');

        // 删除可能存在的冲突表
        await connection.query('DROP TABLE IF EXISTS calendar');
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query('DROP TABLE IF EXISTS user');
        console.log('已删除旧表');

        // 创建新的User表
        await connection.query(`
            CREATE TABLE User (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('已创建新的User表');

        // 创建Diary表
        await connection.query(`
            CREATE TABLE Diary (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                content TEXT NOT NULL,
                mood VARCHAR(20),
                tags VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES User(id)
            )
        `);
        console.log('已创建Diary表');

        // 创建CalendarRecord表
        await connection.query(`
            CREATE TABLE CalendarRecord (
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
        console.log('已创建CalendarRecord表');

        // 验证表结构
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\n当前所有表:', tables.map(t => Object.values(t)[0]));

        const [userColumns] = await connection.query('DESCRIBE User');
        console.log('\nUser表结构:', userColumns);

        await connection.end();
        console.log('\n数据库修复完成！');
    } catch (error) {
        console.error('数据库修复失败:', error);
    }
};

fixDatabase(); 