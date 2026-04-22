const pool = require('./backend/src/config/db');

async function inspectSchema() {
  const client = await pool.connect();
  try {
    const tables = ['users', 'points_transactions', 'points_wallet', 'admissions'];
    for (const table of tables) {
      console.log(`--- Schema for ${table} ---`);
      const res = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      console.table(res.rows);

      const constraints = await client.query(`
        SELECT conname as constraint_name, 
               contype as constraint_type,
               pg_get_constraintdef(c.oid) as definition
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class cl ON cl.oid = c.conrelid
        WHERE cl.relname = $1
      `, [table]);
      console.log(`--- Constraints for ${table} ---`);
      console.table(constraints.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

inspectSchema();
