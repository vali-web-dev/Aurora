#!/usr/bin/env node
/**
 * Database Health Check - Simple
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

    // Get DB info
    const info = await client`SELECT version()`;
    const tables = await client`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const dbStatsRows = await client`
      SELECT numbackends,
             xact_commit,
             xact_rollback,
             blks_read,
             blks_hit,
             tup_returned,
             tup_fetched,
             tup_inserted,
             tup_updated,
             tup_deleted,
             deadlocks,
             temp_files,
             temp_bytes
      FROM pg_stat_database
      WHERE datname = current_database()
    `;
    const dbStats = dbStatsRows?.[0] || {};

    // Simple query test + latency sample
    const queryStart = Date.now();
    await client`SELECT 1`;
    const queryTime = Date.now() - queryStart;

    await client.end();

    const report = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: info?.[0]?.version || null,
      connection: { ok: true, elapsed: connected },
      tables: { count: tables[0].count },
      query: { ok: true, elapsed: queryTime },
      latency: { p50: queryTime, p95: queryTime, sampleCount: 1 },
      stats: {
        connections: Number(dbStats.numbackends || 0),
        transactions: {
          committed: Number(dbStats.xact_commit || 0),
          rolledBack: Number(dbStats.xact_rollback || 0),
        },
        blocks: {
          read: Number(dbStats.blks_read || 0),
          hit: Number(dbStats.blks_hit || 0),
        },
        tuples: {
          returned: Number(dbStats.tup_returned || 0),
          fetched: Number(dbStats.tup_fetched || 0),
          inserted: Number(dbStats.tup_inserted || 0),
          updated: Number(dbStats.tup_updated || 0),
          deleted: Number(dbStats.tup_deleted || 0),
        },
        deadlocks: Number(dbStats.deadlocks || 0),
        tempFiles: Number(dbStats.temp_files || 0),
        tempBytes: Number(dbStats.temp_bytes || 0),
      },
      pool: {
        idleTimeoutSec: 10,
        connectTimeoutSec: 10,
      },
    };

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('DATABASE HEALTH CHECK');
      console.log('='.repeat(60));
      if (report.version) console.log(`✓ ${report.version}`);
      console.log(`✓ Connected (${connected}ms)`);
      console.log(`✓ ${tables[0].count} tables found`);
      console.log(`✓ Query test OK (${queryTime}ms)`);
      console.log(`✓ Connections: ${report.stats.connections} | Deadlocks: ${report.stats.deadlocks}`);
      console.log(`✓ Temp files: ${report.stats.tempFiles} | Temp bytes: ${report.stats.tempBytes}`);
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
