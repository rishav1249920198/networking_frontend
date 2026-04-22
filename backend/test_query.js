const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testQuery() {
  try {
    const userRes = await pool.query("SELECT id FROM users LIMIT 1");
    if (userRes.rows.length === 0) return console.log('No users');
    const userId = userRes.rows[0].id;
    console.log(`Testing query for user ${userId}`);
    
    const result = await pool.query(`
        SELECT a.id, a.status, a.snapshot_fee, a.created_at, co.name AS course
        FROM admissions a JOIN courses co ON co.id = a.course_id
        WHERE a.student_id = $1 ORDER BY a.created_at DESC LIMIT 10
      `, [userId]);
    
    console.log('Result:', result.rows);
    process.exit(0);
  } catch (err) {
    console.error('Query Test Failed:', err);
    process.exit(1);
  }
}
testQuery();
