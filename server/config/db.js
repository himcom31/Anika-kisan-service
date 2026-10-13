const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:     process.env.MYSQL_HOST     || 'localhost',
    user:     process.env.MYSQL_USER     || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'orchard',
    port:     process.env.MYSQL_PORT     || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        // ✅ UTC force karo — local aur live dono pe same behaviour
        await connection.query("SET time_zone = '+00:00'");
        console.log("MySQL Connected...");
        connection.release();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = { connectDB, pool };