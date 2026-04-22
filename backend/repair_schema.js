const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'admissions'
    `);
    const columns = res.rows.map(r => r.column_name);
    console.log('Columns in admissions:', columns);
    process.exit(0);
  } catch (err) {
    console.error('Schema check failed:', err);
    process.exit(1);
  }
}

checkSchema();
