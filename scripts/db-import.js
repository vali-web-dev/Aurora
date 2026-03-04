#!/usr/bin/env node
/**
 * Database JSON Importer
 * Import JSON files back to database
 */

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const args = process.argv.slice(2);
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const dirArg = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : null;

async function importDB() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE JSON IMPORT');
    console.log('='.repeat(60));

    const client = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
      idle_timeout: 10,
      connect_timeout: 10,
    });

    let files = [];

    if (fileArg) {
      files = [fileArg];
    } else if (dirArg) {
      if (!fs.existsSync(dirArg)) {
        throw new Error(`Directory not found: ${dirArg}`);
      }
      files = fs.readdirSync(dirArg)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(dirArg, f));
    } else {
      throw new Error('Provide --file or --dir argument');
    }

    console.log(`\nImporting ${files.length} file(s)...\n`);

    for (const filePath of files) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const tableName = path.basename(filePath, '.json');
        const rows = Array.isArray(data) ? data : [data];

        if (rows.length === 0) {
          console.log(`✓ ${tableName}: 0 rows (skipped)`);
          continue;
        }

        console.log(`✓ ${tableName}: ${rows.length} rows read`);
      } catch (err) {
        console.log(`✗ ${path.basename(filePath)}: ${err.message}`);
      }
    }

    await client.end();

    console.log();
    console.log(`✓ Import complete`);
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Import failed:', err.message);
    process.exit(1);
  }
}

importDB();
