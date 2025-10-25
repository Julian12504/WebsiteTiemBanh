import mysql from 'mysql2/promise';
import 'dotenv/config';

// Add detailed error logging
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cake_fantasy_db',
  waitForConnections: true,
  connectionLimit: 20, // Increase connection limit
  queueLimit: 0,
  debug: process.env.NODE_ENV === 'development' // Enable SQL debugging in dev
});

// Test connection with retry logic
const testConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
      const [rows] = await connection.query('SELECT 1+1 AS result');
      console.log('Database query test successful:', rows[0].result);
      connection.release();
      return;
    } catch (err) {
      console.log(`⏳ Waiting for MySQL... (attempt ${i + 1}/${retries})`);
      if (i === retries - 1) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Database config:', {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          database: process.env.DB_NAME
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

testConnection();

export default pool;