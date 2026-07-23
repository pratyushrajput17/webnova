import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  console.log("Current tables:", tables.rows.map(r => r.tablename));

  // Check row counts for existing tables
  for (const table of tables.rows.map(r => r.tablename)) {
    const count = await client.query(`SELECT count(*) FROM "${table}"`);
    console.log(`  ${table}: ${count.rows[0].count} rows`);
  }

  await client.end();
  pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
