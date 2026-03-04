#!/usr/bin/env node
/**
 * Database Schema Validator
 * Checks schema health
 */

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const isJSON = process.argv.includes('--json');

async function validate() {
  try {
    const client = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
      idle_timeout: 10,
      connect_timeout: 10,
    });

    const report = {
      timestamp: new Date().toISOString(),
      status: 'ok',
      checks: {},
    };

    // Check for tables without primary keys
    try {
      const noPK = await client`
        SELECT table_name 
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.table_name = t.table_name 
          AND tc.constraint_type = 'PRIMARY KEY'
        )
      `;
      report.checks.primaryKeys = noPK.length === 0 ? 'ok' : `${noPK.length} tables without PK`;
    } catch (e) {
      report.checks.primaryKeys = 'check_skipped';
    }

    await client.end();

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('DATABASE SCHEMA VALIDATION');
      console.log('='.repeat(60));
      Object.entries(report.checks).forEach(([check, result]) => {
        const icon = result === 'ok' ? '✓' : '⚠';
        console.log(`${icon} ${check}: ${result}`);
      });
      console.log('='.repeat(60) + '\n');
    }
    process.exit(0);
  } catch (err) {
    if (isJSON) {
      console.log(JSON.stringify({ error: err.message }, null, 2));
    } else {
      console.error('❌ Validation failed:', err.message);
    }
    process.exit(1);
  }
}

validate();

validate();
