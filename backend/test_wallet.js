const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });
const PointsService = require('./src/services/pointsService');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testWallet() {
  try {
    const userRes = await pool.query("SELECT id FROM users LIMIT 1");
    if (userRes.rows.length === 0) return console.log('No users');
    const userId = userRes.rows[0].id;
    console.log(`Testing wallet for user ${userId}`);
    const summary = await PointsService.getWalletSummary(userId);
    console.log('Summary:', summary);
    process.exit(0);
  } catch (err) {
    console.error('Wallet Test Failed:', err);
    process.exit(1);
  }
}
testWallet();
