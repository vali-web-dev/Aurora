import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Database Index Creation Script
 * Creates all essential indexes for improved query performance
 * Run: node scripts/db-create-indexes.js
 */

const INDEXES = {
  commerce: [
    'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status)',
    
    'CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)',
    'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
    'CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)',
    
    'CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id)',
    'CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number)',
    'CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status)',
    'CREATE INDEX IF NOT EXISTS idx_shipments_order_status ON shipments(order_id, status)',
    
    'CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC)',
  ],
  
  social: [
    'CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)',
    
    'CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)',
    'CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC)',
    
    'CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id)',
  ],
  
  analytics: [
    'CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)',
    'CREATE INDEX IF NOT EXISTS idx_events_action ON events(action)',
    'CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC)',
    'CREATE INDEX IF NOT EXISTS idx_events_category_timestamp ON events(category, timestamp DESC)',
  ],
};

async function createIndexes() {
  console.log('🗄️  Starting database index creation...\n');
  
  const categories = Object.entries(INDEXES);
  let successCount = 0;
  let errorCount = 0;
  
  for (const [category, queries] of categories) {
    console.log(`📊 Creating ${category} indexes...`);
    
    for (const query of queries) {
      try {
        await db.execute(sql.raw(query));
        console.log(`  ✓ ${query.split('ON')[1]?.trim().split('(')[0] || 'Index'}`);
        successCount++;
      } catch (err) {
        console.error(`  ✗ Failed: ${err instanceof Error ? err.message : String(err)}`);
        errorCount++;
      }
    }
    
    console.log('');
  }
  
  console.log('📈 Index Creation Summary');
  console.log(`  ✓ Successful: ${successCount}`);
  console.log(`  ✗ Failed: ${errorCount}`);
  console.log(`  📊 Total: ${successCount + errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n✅ All indexes created successfully!');
    
    // Analyze new indexes
    console.log('\n🔍 Analyzing indexes...');
    try {
      await db.execute(sql.raw('ANALYZE'));
      console.log('✓ Database analysis complete\n');
    } catch (err) {
      console.error('⚠️  Analysis failed:', err);
    }
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

createIndexes().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
