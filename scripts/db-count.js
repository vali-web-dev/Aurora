#!/usr/bin/env node
/**
 * Database Row Counter
 * Quick overview of table sizes
 */

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
  idle_timeout: 10,
  connect_timeout: 10,
});

const isJSON = process.argv.includes('--json');
const doSort = process.argv.includes('--sort');

async function count() {
  try {
    // Get all tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    const counts = [];
    let totalRows = 0;

    for (const t of tables) {
      // Use string interpolation safely with postgres
      const rawCount = await client.unsafe(
        `SELECT COUNT(*) as count FROM "${t.table_name}"`
      );
      const rowCount = parseInt(rawCount[0].count, 10);
      counts.push({ table: t.table_name, rows: rowCount });
      totalRows += rowCount;
    }

    if (doSort) {
      counts.sort((a, b) => b.rows - a.rows);
    }

    await client.end();

    const report = { timestamp: new Date().toISOString(), counts, totalRows };

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('DATABASE ROW COUNT');
      console.log('='.repeat(60));
      console.log();
      counts.forEach((item, i) => {
        console.log(`${i + 1}. ${item.table}: ${item.rows.toLocaleString()} rows`);
      });
      console.log();
      console.log(`Total: ${totalRows.toLocaleString()} rows across ${counts.length} tables`);
      console.log('='.repeat(60) + '\n');
    }
    process.exit(0);
  } catch (err) {
    if (isJSON) {
      console.log(JSON.stringify({ error: err.message }, null, 2));
    } else {
      console.error('❌ Count failed:', err.message);
    }
    process.exit(1);
  }
}

count();
