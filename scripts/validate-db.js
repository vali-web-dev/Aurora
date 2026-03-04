#!/usr/bin/env node
/**
 * Aurora Database Connection Validator
 * 
 * Tests connection and displays useful diagnostics
 * Usage: node scripts/validate-db.js
 */

import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

async function validateDatabase() {
  console.log('\n🔍 Aurora Database Connection Validator');
  console.log('========================================\n');

  // Check environment
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env.local');
    console.error('\n📖 Instructions:');
    console.error('   1. See DATABASE_QUICK_START.md');
    console.error('   2. Choose Supabase, Docker, or other provider');
    console.error('   3. Update DATABASE_URL in .env.local\n');
    process.exit(1);
  }

  // Parse connection string
  console.log('📋 Connection String Analysis:');
  try {
    const url = new URL(DATABASE_URL);
    console.log(`   Protocol:  ${url.protocol}`);
    console.log(`   Host:      ${url.hostname}`);
    console.log(`   Port:      ${url.port || '5432'}`);
    console.log(`   Database:  ${url.pathname.replace('/', '')}`);
    console.log(`   SSL:       ${url.searchParams.get('sslmode') ? '✓ Enabled' : '✗ Disabled'}`);
    console.log('');
  } catch (error) {
    console.error(`   ❌ Invalid connection string: ${error.message}\n`);
    process.exit(1);
  }

  // Test connection
  console.log('🔗 Testing Connection...');
  try {
    const sql = postgres(DATABASE_URL, {
      idle_timeout: 5,
      connect_timeout: 10,
    });

    const startTime = Date.now();
    const result = await sql`SELECT NOW() as time, version() as version`;
    const duration = Date.now() - startTime;

    console.log(`   ✅ Connected successfully (${duration}ms)`);
    console.log(`   Time:     ${result[0].time}`);
    console.log(`   Version:  PostgreSQL ${result[0].version.split('(')[0].trim()}`);
    console.log('');

    // Check tables
    console.log('📊 Table Status:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('   ⚠️  No tables found. Run: npm run db:init');
    } else {
      console.log(`   ✅ Found ${tables.length} tables:`);
      tables.slice(0, 10).forEach(t => {
        console.log(`      • ${t.table_name}`);
      });
      if (tables.length > 10) {
        console.log(`      ... and ${tables.length - 10} more`);
      }
    }
    console.log('');

    await sql.end();

    // Next steps
    console.log('✅ Connection verified!\n');
    if (tables.length === 0) {
      console.log('🎯 Next: npm run db:init');
    } else {
      console.log('🎯 Next: npm run dev');
    }
    console.log('');

  } catch (error) {
    console.error(`   ❌ Connection failed\n`);
    console.error(`Error: ${error.message}\n`);

    // Diagnostics
    console.error('🔧 Troubleshooting:\n');
    if (error.message.includes('ENOTFOUND')) {
      console.error('   • Hostname not found - verify DATABASE_URL');
      console.error('   • For Supabase: Copy from Settings → Database → Connection string');
    } else if (error.message.includes('password')) {
      console.error('   • Password authentication failed');
      console.error('   • Check password in connection string');
      console.error('   • URL-encode special characters: @ → %40, : → %3A, etc');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('   • Connection refused - server not running');
      console.error('   • Docker: Run docker compose up postgres -d');
      console.error('   • Supabase: Verify project is initialized');
    } else if (error.message.includes('SSL')) {
      console.error('   • SSL/TLS issue - try adding: ?sslmode=require');
    }
    console.error('');
    process.exit(1);
  }
}

validateDatabase();
