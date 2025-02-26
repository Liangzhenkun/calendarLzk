const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Bruce',
    password: process.env.DB_PASSWORD || '123456lzk',
    database: process.env.DB_NAME || 'calendar'
});

module.exports = pool; 