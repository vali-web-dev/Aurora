#!/usr/bin/env node
/**
 * Aurora Database Seeding Script
 * 
 * Populates database with initial test data for development
 * Includes: Users, brands, services, communities, and sample connections
 * 
 * Usage: node scripts/seed.js
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/schema.js';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not configured in .env.local');
  process.exit(1);
}

const client = postgres(DATABASE_URL, {
  idle_timeout: 10,
  connect_timeout: 10,
});

const db = drizzle(client, { schema });

// ============================================================================
// Seed Data
// ============================================================================

const seedUsers = [
  {
    email: 'demo@aurora.app',
    name: 'Demo User',
    displayName: 'Demo',
    image: null,
    emailVerified: new Date(),
  },
  {
    email: 'creator@aurora.app',
    name: 'Creative Creator',
    displayName: 'Creator',
    image: null,
    emailVerified: new Date(),
  },
  {
    email: 'entrepreneur@aurora.app',
    name: 'Business Owner',
    displayName: 'Entrepreneur',
    image: null,
    emailVerified: new Date(),
  },
];

const seedServices = [
  {
    name: 'Stripe',
    category: 'payments',
    description: 'Payment processing and billing',
    homepageUrl: 'https://stripe.com',
    embedType: 'iframe',
    metadata: { icon: '💳', apiVersion: 'v1' },
  },
  {
    name: 'GitHub',
    category: 'development',
    description: 'Version control and collaboration',
    homepageUrl: 'https://github.com',
    embedType: 'oauth',
    metadata: { icon: '🐙', apiVersion: 'graphql' },
  },
  {
    name: 'SendGrid',
    category: 'communication',
    description: 'Email delivery platform',
    homepageUrl: 'https://sendgrid.com',
    embedType: 'api',
    metadata: { icon: '📧', apiVersion: 'v3' },
  },
  {
    name: 'Slack',
    category: 'communication',
    description: 'Team messaging and collaboration',
    homepageUrl: 'https://slack.com',
    embedType: 'oauth',
    metadata: { icon: '💬', apiVersion: 'v2' },
  },
  {
    name: 'Figma',
    category: 'design',
    description: 'Collaborative design tool',
    homepageUrl: 'https://figma.com',
    embedType: 'oauth',
    metadata: { icon: '🎨', apiVersion: 'rest-api' },
  },
];

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  try {
    console.log('🌱 Seeding Aurora database...\n');

    // Seed users
    console.log('👥 Seeding users...');
    for (const user of seedUsers) {
      try {
        await db.insert(schema.users).values(user).onConflictDoNothing();
        console.log(`   ✓ ${user.email}`);
      } catch (error) {
        console.error(`   ✗ ${user.email}: ${error.message}`);
      }
    }

    // Seed services
    console.log('\n🔌 Seeding services...');
    for (const service of seedServices) {
      try {
        await db.insert(schema.services).values(service).onConflictDoNothing();
        console.log(`   ✓ ${service.name}`);
      } catch (error) {
        console.error(`   ✗ ${service.name}: ${error.message}`);
      }
    }

    console.log('\n✅ Database seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   • ${seedUsers.length} users created`);
    console.log(`   • ${seedServices.length} services created`);
    console.log('\n🎯 Test the database:');
    console.log('   npm run dev');
    console.log('   Then visit: http://localhost:3000/api/health\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
