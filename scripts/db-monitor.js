import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Database Monitoring Script
 * Analyzes query performance and identifies slow queries
 * Run: node scripts/db-monitor.js
 */

async function analyzeQueries() {
  console.log('📊 Aurora Database Query Analysis\n');
  
  try {
    // Check if pg_stat_statements extension exists
    const extCheck = await db.execute(sql.raw(
      "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements')"
    ));
    
    const hasExtension = extCheck.rows?.[0]?.exists;
    
    if (!hasExtension) {
      console.log('⚠️  pg_stat_statements extension not enabled.');
      console.log('   Run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;\n');
      return;
    }
    
    // Top 10 slowest queries
    console.log('🐢 Top 10 Slowest Queries (by mean time)\n');
    const slowQueries = await db.execute(sql.raw(`
      SELECT 
        query,
        calls,
        total_exec_time / calls as mean_ms,
        total_exec_time,
        max_exec_time,
        rows
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
        AND query NOT LIKE '%ANALYZE%'
      ORDER BY mean_ms DESC
      LIMIT 10;
    `));
    
    if (slowQueries.rows && slowQueries.rows.length > 0) {
      slowQueries.rows.forEach((row: any, i) => {
        console.log(`${i + 1}. Mean: ${row.mean_ms.toFixed(2)}ms | Calls: ${row.calls} | Max: ${row.max_exec_time.toFixed(2)}ms`);
        console.log(`   Query: ${row.query.substring(0, 80)}${row.query.length > 80 ? '...' : ''}\n`);
      });
    } else {
      console.log('  No slow queries found.\n');
    }
    
    // Unused indexes
    console.log('🔍 Unused Indexes (candidates for deletion)\n');
    const unusedIndexes = await db.execute(sql.raw(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
        AND indexname NOT LIKE 'pg_toast%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10;
    `));
    
    if (unusedIndexes.rows && unusedIndexes.rows.length > 0) {
      unusedIndexes.rows.forEach((row: any) => {
        console.log(`  ⚠️  ${row.indexname} on ${row.tablename} (${row.size})`);
        console.log(`      Drop: DROP INDEX ${row.indexname};`);
      });
      console.log('');
    } else {
      console.log('  All indexes are being used.\n');
    }
    
    // Table sizes
    console.log('📈 Table Sizes (Top 5 by disk usage)\n');
    const tableSizes = await db.execute(sql.raw(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
      LIMIT 5;
    `));
    
    if (tableSizes.rows && tableSizes.rows.length > 0) {
      tableSizes.rows.forEach((row: any, i) => {
        console.log(`${i + 1}. ${row.tablename}: ${row.size} (${row.row_count.toLocaleString()} rows)`);
      });
      console.log('');
    }
    
    // Cache hit ratio
    console.log('💾 PostgreSQL Cache Health\n');
    const cacheHealth = await db.execute(sql.raw(`
      SELECT
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
      FROM pg_statio_user_tables;
    `));
    
    if (cacheHealth.rows && cacheHealth.rows.length > 0) {
      const [row] = cacheHealth.rows;
      const hitRatio = ((row.ratio || 0) * 100).toFixed(2);
      console.log(`  Hit Ratio: ${hitRatio}%`);
      console.log(`  Target: > 99%`);
      console.log(`  Status: ${hitRatio >= 99 ? '✅ Good' : '⚠️  Could improve'}\n`);
    }
    
    // Missing indexes (frequently scanned tables without indexes)
    console.log('🎯 Missing Index Opportunities\n');
    const missingIndexes = await db.execute(sql.raw(`
      SELECT
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        CASE WHEN seq_scan > 1000 AND idx_scan = 0 THEN 'HIGH PRIORITY' ELSE 'Normal' END as priority
      FROM pg_stat_user_tables
      WHERE seq_scan > 100
        AND seq_scan > idx_scan * 10
      ORDER BY seq_scan DESC
      LIMIT 5;
    `));
    
    if (missingIndexes.rows && missingIndexes.rows.length > 0) {
      missingIndexes.rows.forEach((row: any) => {
        console.log(`  ${row.priority}: ${row.tablename}`);
        console.log(`    Sequential scans: ${row.seq_scan} | Index scans: ${row.idx_scan}`);
      });
      console.log('');
    } else {
      console.log('  No missing indexes detected.\n');
    }
    
    // Recommendations
    console.log('💡 Recommendations\n');
    
    if (slowQueries.rows && slowQueries.rows.length > 0) {
      const avgSlow = slowQueries.rows.reduce((sum: number, row: any) => sum + row.mean_ms, 0) / slowQueries.rows.length;
      if (avgSlow > 100) {
        console.log('  1. Review slow query optimization:');
        console.log(`     - Add indexes on WHERE clause columns`);
        console.log(`     - Consider query restructuring\n`);
      }
    }
    
    if (tableSizes.rows && tableSizes.rows.length > 0) {
      const largestTable = tableSizes.rows[0];
      console.log(`  2. Monitor large table growth (${largestTable.tablename})`);
      console.log(`     - Archive old records regularly`);
      console.log(`     - Consider table partitioning\n`);
    }
    
    console.log('  3. Enable slow query logging in production:');
    console.log(`     ALTER DATABASE aurora SET log_min_duration_statement = 1000;\n`);
    
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : String(err));
    console.log('\nMake sure:');
    console.log('  1. PostgreSQL extension is installed: CREATE EXTENSION pg_stat_statements;');
    console.log('  2. Database connection is working');
    process.exit(1);
  }
}

// Reset statistics option
if (process.argv[2] === '--reset') {
  console.log('🔄 Resetting query statistics...');
  db.execute(sql.raw('SELECT pg_stat_statements_reset()'))
    .then(() => {
      console.log('✓ Statistics reset\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
} else {
  analyzeQueries().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
