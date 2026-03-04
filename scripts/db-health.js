#!/usr/bin/env node
/**
 * Database Health Check
 * Test connection, performance, and basic diagnostics
 */

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const isJSON = process.argv.includes('--json');

async function check() {
  try {
    const start = Date.now();
    const client = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
      idle_timeout: 10,
      connect_timeout: 10,
    });

    const connected = Date.now() - start;

    // Simple query test
    const queryStart = Date.now();
    await client`SELECT 1`;
    const queryTime = Date.now() - queryStart;

    await client.end();

    const report = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      connection: { ok: true, elapsed: connected },
      query: { ok: true, elapsed: queryTime },
    };

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('DATABASE HEALTH CHECK');
      console.log('='.repeat(60));
      console.log(`✓ Connected (${connected}ms)`);
      console.log(`✓ Query test OK (${queryTime}ms)`);
      console.log('='.repeat(60) + '\n');
    }
    process.exit(0);
  } catch (err) {
    if (isJSON) {
      console.log(JSON.stringify({ status: 'unhealthy', error: err.message }, null, 2));
    } else {
      console.error('\n❌ Health check failed:', err.message);
    }
    process.exit(1);
  }
}

check();
  try {
    const report = {
      timestamp: new Date().toISOString(),
      checks: {
        connection: { ok: false, elapsed: 0, message: '' },
        database: { ok: false, name: '', size: '' },
        tables: { ok: false, count: 0 },
        query: { ok: false, elapsed: 0, message: '' },
      },
      status: 'unhealthy',
    };

    // Check connection
    let startTime = Date.now();
    const client = await pool.connect();
    report.checks.connection.elapsed = Date.now() - startTime;
    report.checks.connection.ok = true;
    report.checks.connection.message = 'Connected';

    // Get database info
    const dbResult = await client.query(`
      SELECT datname, pg_database_size(datname) as size
      FROM pg_database
      WHERE datname = current_database();
    `);

    if (dbResult.rows.length > 0) {
      const db = dbResult.rows[0];
      const sizeBytes = parseInt(db.size, 10);
      const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
      report.checks.database.ok = true;
      report.checks.database.name = db.datname;
      report.checks.database.sizeBytes = sizeBytes;
      report.checks.database.sizeMB = sizeMB;
    }

    // Count tables
    const tableResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);

    const tableCount = parseInt(tableResult.rows[0].count, 10);
    report.checks.tables.ok = tableCount > 0;
    report.checks.tables.count = tableCount;

    // Performance query
    startTime = Date.now();
    const queryResult = await client.query(`
      SELECT 1 as test;
    `);
    report.checks.query.elapsed = Date.now() - startTime;
    report.checks.query.ok = queryResult.rows.length > 0;
    report.checks.query.message = queryResult.rows.length > 0 ? 'Query OK' : 'Query failed';

    // Determine overall status
    const allOk = Object.values(report.checks).every(c => c.ok);
    report.status = allOk ? 'healthy' : 'degraded';

    client.release();

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    process.exit(allOk ? 0 : 1);
  } catch (err) {
    if (isJSON) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: err.message,
      }, null, 2));
    } else {
      console.error('\n❌ Health check failed:', err.message);
    }
    process.exit(1);
  }
}

function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('DATABASE HEALTH CHECK');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Status: ${report.status === 'healthy' ? '✅ HEALTHY' : '⚠️ DEGRADED'}\n`);

  const checks = report.checks;

  console.log('Connection:');
  console.log(`  ${checks.connection.ok ? '✓' : '✗'} ${checks.connection.message} (${checks.connection.elapsed}ms)`);

  console.log('\nDatabase:');
  console.log(`  ${checks.database.ok ? '✓' : '✗'} ${checks.database.name} (${checks.database.sizeMB}MB)`);

  console.log('\nTables:');
  console.log(`  ${checks.tables.ok ? '✓' : '✗'} ${checks.tables.count} public tables`);

  console.log('\nQuery Performance:');
  console.log(`  ${checks.query.ok ? '✓' : '✗'} ${checks.query.message} (${checks.query.elapsed}ms)`);

  console.log('\n' + '='.repeat(60) + '\n');
}

healthCheck();
