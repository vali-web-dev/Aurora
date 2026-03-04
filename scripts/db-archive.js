import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Data Archival Script
 * Archives old records to maintain database performance
 * Run: node scripts/db-archive.js [--dry-run] [--days=90]
 */

const ARCHIVE_RULES = {
  events: {
    days: 90,
    archiveTable: 'events_archive',
    dateColumn: 'timestamp',
    description: 'Analytics events older than 90 days',
  },
  orders: {
    days: 730, // 2 years
    archiveTable: 'orders_archive',
    dateColumn: 'created_at',
    description: 'Completed orders older than 2 years',
  },
};

interface ArchiveResult {
  table: string;
  archivedRows: number;
  archiveSize: string;
  duration: number;
}

async function archiveTable(
  table: string,
  dateColumn: string,
  days: number,
  dryRun = false
): Promise<ArchiveResult> {
  const startTime = Date.now();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  console.log(`\n📦 Archiving ${table}...`);
  console.log(`   Cutoff date: ${cutoffDate.toISOString().split('T')[0]} (${days} days ago)`);
  
  // Count rows to archive
  const countResult = await db.execute(sql.raw(`
    SELECT COUNT(*) as count
    FROM ${table}
    WHERE ${dateColumn} < $1
  `, [cutoffDate.toISOString()]));
  
  const rowCount = countResult.rows?.[0]?.count || 0;
  
  if (rowCount === 0) {
    console.log(`   No records to archive`);
    return { table, archivedRows: 0, archiveSize: '0 B', duration: 0 };
  }
  
  console.log(`   Found ${rowCount.toLocaleString()} records to archive`);
  
  if (dryRun) {
    console.log(`   [DRY RUN] Would archive these records`);
    return { table, archivedRows: rowCount, archiveSize: 'N/A', duration: Date.now() - startTime };
  }
  
  try {
    // Create archive table if it doesn't exist
    console.log(`   Creating archive table...`);
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS ${table}_archive AS
      SELECT * FROM ${table}
      WHERE FALSE
    `));
    
    // Copy records to archive
    console.log(`   Copying records to archive...`);
    await db.execute(sql.raw(`
      INSERT INTO ${table}_archive
      SELECT * FROM ${table}
      WHERE ${dateColumn} < $1
    `, [cutoffDate.toISOString()]));
    
    // Delete from main table
    console.log(`   Removing from main table...`);
    await db.execute(sql.raw(`
      DELETE FROM ${table}
      WHERE ${dateColumn} < $1
    `, [cutoffDate.toISOString()]));
    
    // Get archive size
    const sizeResult = await db.execute(sql.raw(`
      SELECT pg_size_pretty(pg_total_relation_size('${table}_archive')) as size
    `));
    
    const archiveSize = (sizeResult.rows?.[0]?.size as string) || 'N/A';
    
    // Vacuum
    console.log(`   Vacuuming table...`);
    await db.execute(sql.raw(`VACUUM ANALYZE ${table}`));
    
    const duration = Date.now() - startTime;
    console.log(`   ✓ Archived ${rowCount.toLocaleString()} records in ${(duration / 1000).toFixed(2)}s`);
    
    return { table, archivedRows: rowCount, archiveSize, duration };
    
  } catch (err) {
    console.error(`   ✗ Error archiving ${table}: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

async function runArchival() {
  console.log('📊 Aurora Database Archival Script\n');
  
  const dryRun = process.argv.includes('--dry-run');
  const daysParam = process.argv.find((arg) => arg.startsWith('--days='));
  const daysOverride = daysParam ? parseInt(daysParam.split('=')[1], 10) : null;
  
  if (dryRun) {
    console.log('🔍 Running in DRY-RUN mode (no changes will be made)\n');
  }
  
  const results: ArchiveResult[] = [];
  
  try {
    for (const [table, config] of Object.entries(ARCHIVE_RULES)) {
      const days = daysOverride || config.days;
      
      try {
        const result = await archiveTable(
          table,
          config.dateColumn,
          days,
          dryRun
        );
        results.push(result);
      } catch (err) {
        console.error(`Failed to archive ${table}`);
        // Continue with next table
      }
    }
    
    // Summary
    console.log('\n\n📈 Archival Summary');
    console.log('═'.repeat(60));
    
    results.forEach((result) => {
      console.log(`${result.table.padEnd(20)} ${result.archivedRows.toString().padStart(10)} rows  ${result.archiveSize.padStart(15)}`);
    });
    
    const totalArchivedRows = results.reduce((sum, r) => sum + r.archivedRows, 0);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log('═'.repeat(60));
    console.log(`Total archived: ${totalArchivedRows.toLocaleString()} rows in ${(totalDuration / 1000).toFixed(2)}s`);
    
    if (dryRun) {
      console.log('\n💡 To execute archival: node scripts/db-archive.js');
    } else {
      console.log('\n✅ Archival complete!');
      console.log('\n💡 Archival recommendations:');
      console.log('  - Schedule this script weekly via cron');
      console.log('  - Export archived tables to S3 for long-term storage');
      console.log('  - Set retention policy (archive after 1 year, delete after 7 years)');
    }
    
  } catch (err) {
    console.error('\n❌ Fatal error during archival:', err);
    process.exit(1);
  }
}

runArchival().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
