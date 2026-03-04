#!/usr/bin/env node
/**
 * Database Inspector
 * Lists all tables, row counts, and schema insights
 */

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const isJSON = process.argv.includes('--json');

async function inspect() {
  try {
    const client = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
      idle_timeout: 10,
      connect_timeout: 10,
    });

    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    const report = {
      timestamp: new Date().toISOString(),
      tableCount: tables.length,
      tables: tables.map(t => ({ name: t.table_name })),
    };

    await client.end();

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('DATABASE INSPECTION');
      console.log('='.repeat(60));
      console.log(`Total Tables: ${report.tableCount}\n`);
      report.tables.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name}`);
      });
      console.log('='.repeat(60) + '\n');
    }
    process.exit(0);
  } catch (err) {
    if (isJSON) {
      console.log(JSON.stringify({ error: err.message }, null, 2));
    } else {
      console.error('❌ Inspection failed:', err.message);
    }
    process.exit(1);
  }
}

inspect();
