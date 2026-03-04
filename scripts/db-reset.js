#!/usr/bin/env node
/**
 * Database Reset Utility
 * Safely truncate all tables
 */

const postgres = require('postgres');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const noPrompt = process.argv.includes('--no-prompt');
const cascade = process.argv.includes('--cascade');

async function reset() {
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

    if (tables.length === 0) {
      console.log('✓ No tables to reset.');
      await client.end();
      process.exit(0);
    }

    console.log('\n' + '='.repeat(60));
    console.log('DATABASE RESET UTILITY');
    console.log('='.repeat(60));
    console.log(`\nTables to reset (${tables.length}):`);
    tables.forEach(t => console.log(`  • ${t.table_name}`));

    if (!noPrompt) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const confirmed = await new Promise(resolve => {
        rl.question(`\n⚠️  This will truncate ALL data. Type 'reset' to confirm: `, answer => {
          rl.close();
          resolve(answer.toLowerCase());
        });
      });

      if (confirmed !== 'reset') {
        console.log('✓ Cancelled.');
        await client.end();
        process.exit(0);
      }
    }

    console.log('\n⏳ Resetting tables...\n');

    for (const t of tables) {
      try {
        const cascadeStr = cascade ? ' CASCADE' : '';
        await client.unsafe(`TRUNCATE TABLE "${t.table_name}" RESTART IDENTITY${cascadeStr}`);
        console.log(`✓ ${t.table_name}`);
      } catch (err) {
        console.log(`✗ ${t.table_name}: ${err.message}`);
      }
    }

    await client.end();

    console.log('\n' + '='.repeat(60));
    console.log('✓ Reset complete');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Reset failed:', err.message);
    process.exit(1);
  }
}

reset();
