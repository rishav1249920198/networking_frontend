const pool = require('./backend/src/config/db');

async function validateBackend() {
  try {
    console.log('--- Checking for Duplicate Transactions ---');
    const dupes = await pool.query(`
      SELECT admission_id, type, COUNT(*) 
      FROM points_transactions 
      WHERE admission_id IS NOT NULL 
      GROUP BY admission_id, type 
      HAVING COUNT(*) > 1
    `);
    if (dupes.rows.length > 0) {
      console.warn('⚠️ Found duplicate payouts:', dupes.rows);
    } else {
      console.log('✅ No duplicate payouts found.');
    }

    console.log('--- Checking Wallet-Transaction Consistency ---');
    const syncRes = await pool.query(`
      SELECT 
        w.user_id, 
        w.total_rupees as wallet_rupees, 
        COALESCE(SUM(t.rupees), 0) as trans_rupees
      FROM points_wallet w
      LEFT JOIN points_transactions t ON w.user_id = t.user_id
      GROUP BY w.user_id, w.total_rupees
      HAVING ABS(w.total_rupees - COALESCE(SUM(t.rupees), 0)) > 0.01
    `);
    if (syncRes.rows.length > 0) {
      console.warn('⚠️ Wallet mismatch found for users:', syncRes.rows);
    } else {
      console.log('✅ All wallet balances match transaction history.');
    }

    console.log('--- Checking Withdrawal Lock Consistency ---');
    const lockCheck = await pool.query(`
      SELECT id, left_count, right_count, withdrawal_unlocked 
      FROM users 
      WHERE (left_count >= 1 AND right_count >= 1 AND withdrawal_unlocked = FALSE)
      OR ((left_count = 0 OR right_count = 0) AND withdrawal_unlocked = TRUE)
    `);
    // Note: It's okay if withdrawal_unlocked=TRUE but counts=0 IF it was backfilled/unlocked manually, 
    // but usually they should align.
    if (lockCheck.rows.length > 0) {
      console.log('ℹ️ Users with unlock status mismatch (some may be intentional backfills):', lockCheck.rows.length);
    } else {
      console.log('✅ Withdrawal unlock status is consistent with tree counts.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

validateBackend();
