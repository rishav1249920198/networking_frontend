const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });
const DashboardService = require('./src/services/dashboardService');
const PointsService = require('./src/services/pointsService');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDashboard() {
  try {
    // 1. Get a student ID
    const userRes = await pool.query(`
      SELECT u.id, u.full_name 
      FROM users u 
      JOIN roles r ON r.id = u.role_id 
      WHERE r.name = 'student' 
      LIMIT 1
    `);
    
    if (userRes.rows.length === 0) {
      console.log('No students found to test.');
      process.exit(0);
    }
    
    const userId = userRes.rows[0].id;
    console.log(`Testing dashboard for user: ${userRes.rows[0].full_name} (${userId})`);

    console.log('Fetching Student Stats...');
    const stats = await DashboardService.getStudentStats(userId);
    console.log('Stats:', JSON.stringify(stats, null, 2));

    console.log('Fetching Earnings Breakdown...');
    const breakdown = await PointsService.getEarningsBreakdown(userId);
    console.log('Breakdown:', JSON.stringify(breakdown, null, 2));

    console.log('Fetching Chart Data...');
    const chart = await PointsService.getChartData(userId);
    console.log('Chart:', JSON.stringify(chart, null, 2));

    console.log('DASHBOARD TEST SUCCESSFUL');
    process.exit(0);
  } catch (err) {
    console.error('DASHBOARD TEST FAILED:', err);
    process.exit(1);
  }
}

testDashboard();
