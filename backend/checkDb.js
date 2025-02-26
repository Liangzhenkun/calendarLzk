require('dotenv').config();
const mysql = require('mysql2/promise');

const checkDatabase = async () => {
    try {
        // 创建数据库连接
        console.log('尝试连接数据库...');
        console.log('配置信息:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('数据库连接成功！');

        // 检查表是否存在
        console.log('\n检查数据库表...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('现有表:', tables.map(t => Object.values(t)[0]));

        // 检查User表结构
        console.log('\n检查User表结构...');
        const [userColumns] = await connection.query('DESCRIBE User');
        console.log('User表结构:', userColumns);

        await connection.end();
    } catch (error) {
        console.error('数据库检查失败:', error);
    }
};

checkDatabase(); 