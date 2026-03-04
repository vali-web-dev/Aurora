#!/usr/bin/env node
/**
 * Database JSON Exporter
 * Export tables to JSON files
 */

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const exportDir = path.join(process.cwd(), 'db-exports');

const args = process.argv.slice(2);
const tableArg = args.includes('--table') ? args[args.indexOf('--table') + 1] : null;

async function exportDB() {
  try {
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const client = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
      idle_timeout: 10,
      connect_timeout: 10,
    });

    console.log('\n' + '='.repeat(60));
    console.log('DATABASE JSON EXPORT');
    console.log('='.repeat(60));
    console.log(`Export directory: ${exportDir}\n`);

    const tables = tableArg 
      ? [tableArg]
      : (await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`).map(t => t.table_name);

    for (const table of tables) {
      try {
        const rows = await client`SELECT * FROM ${postgres.unsafe(`"${table}"`)}`; 
        const filePath = path.join(exportDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
        console.log(`✓ ${table}: ${rows.length} rows → ${table}.json`);
      } catch (err) {
        console.log(`✗ ${table}: ${err.message}`);
      }
    }

    await client.end();
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Export failed:', err.message);
    process.exit(1);
  }
}

exportDB();
