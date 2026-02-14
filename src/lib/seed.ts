import { config } from 'dotenv';
import {
  users,
  personas,
  brands,
  services,
  communities,
  commerceProviders,
  products,
  learningCourses,
} from './schema';
import bcrypt from 'bcryptjs';

config({ path: '.env.local' });

async function seed() {
  const { db } = await import('./db');
  console.log('🌱 Starting Aurora database seed...');

  try {
    // ========================================================================
    // SEED USERS
    // ========================================================================
    console.log('  → Creating sample users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const sampleUsers = await db
      .insert(users)
      .values([
        {
          email: 'aurora@example.com',
          name: 'Aurora Admin',
          displayName: 'Aurora Admin',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aurora',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aurora',
          passwordHash,
        },
        {
          email: 'creator@example.com',
          name: 'Creative Creator',
          displayName: 'Creative Creator',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Creator',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Creator',
          passwordHash,
        },
        {
          email: 'learner@example.com',
          name: 'Eager Learner',
          displayName: 'Eager Learner',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Learner',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Learner',
          passwordHash,
        },
      ])
      .returning();

    console.log(`  ✓ Created ${sampleUsers.length} users`);

    // ========================================================================
    // SEED PERSONAS
    // ========================================================================
    console.log('  → Creating personas...');
    const samplePersonas = await db
      .insert(personas)
      .values([
        {
          userId: sampleUsers[0].id,
          name: 'Professional',
          mode: 'work',
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en',
          },
        },
        {
          userId: sampleUsers[0].id,
          name: 'Creator',
          mode: 'creative',
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en',
          },
        },
        {
          userId: sampleUsers[1].id,
          name: 'Lifestyle',
          mode: 'lifestyle',
          preferences: {
            theme: 'illuminated',
            notifications: false,
            language: 'en',
          },
        },
      ])
      .returning();

    console.log(`  ✓ Created ${samplePersonas.length} personas`);

    // ========================================================================
    // SEED BRANDS
    // ========================================================================
    console.log('  → Creating brands...');
    const sampleBrands = await db
      .insert(brands)
      .values([
        {
          ownerUserId: sampleUsers[0].id,
          name: 'Aurora Digital',
          slug: 'aurora-digital',
          story: 'A comprehensive digital civilization platform',
          tone: 'warm, calm, professional',
          archetype: 'The Sage',
          vocabulary: {
            primary: ['illuminate', 'connect', 'empower'],
            secondary: ['explore', 'create', 'belong'],
          },
          settings: {
            primaryColor: '#0066ff',
            accentColor: '#00c9ff',
          },
        },
        {
          ownerUserId: sampleUsers[1].id,
          name: 'Creative Studios',
          slug: 'creative-studios',
          story: 'Building beautiful digital experiences',
          tone: 'creative, energetic, bold',
          archetype: 'The Creator',
          vocabulary: {
            primary: ['design', 'innovate', 'express'],
          },
          settings: {
            primaryColor: '#ff6b6b',
            accentColor: '#ffa500',
          },
        },
      ])
      .returning();

    console.log(`  ✓ Created ${sampleBrands.length} brands`);

    // ========================================================================
    // SEED SERVICES
    // ========================================================================
    console.log('  → Creating third-party services...');
    const sampleServices = await db
      .insert(services)
      .values([
        {
          name: 'Spotify',
          category: 'music',
          description: 'Music streaming service',
          homepageUrl: 'https://spotify.com',
          embedType: 'embed',
          metadata: { logo: '🎵', color: '#1DB954' },
        },
        {
          name: 'YouTube',
          category: 'entertainment',
          description: 'Video sharing platform',
          homepageUrl: 'https://youtube.com',
          embedType: 'iframe',
          metadata: { logo: '▶️', color: '#FF0000' },
        },
        {
          name: 'LinkedIn Learning',
          category: 'learning',
          description: 'Professional learning platform',
          homepageUrl: 'https://learning.linkedin.com',
          embedType: 'embed',
          metadata: { logo: '💼', color: '#0A66C2' },
        },
        {
          name: 'Shopify',
          category: 'ecommerce',
          description: 'E-commerce platform',
          homepageUrl: 'https://shopify.com',
          embedType: 'api',
          metadata: { logo: '🛍️', color: '#96BE3D' },
        },
      ])
      .returning();

    console.log(`  ✓ Created ${sampleServices.length} services`);

    // ========================================================================
    // SEED COMMERCE
    // ========================================================================
    console.log('  → Creating commerce providers and products...');
    const sampleProviders = await db
      .insert(commerceProviders)
      .values([
        {
          name: 'Stripe',
          category: 'payment-processor',
          apiInfo: { version: '2023-10-16' },
        },
        {
          name: 'Aurora Shop',
          category: 'internal-shop',
          apiInfo: { baseUrl: 'https://api.aurora.app' },
        },
      ])
      .returning();

    const sampleProducts = await db
      .insert(products)
      .values([
        {
          providerId: sampleProviders[1].id,
          externalId: 'prod_aurora_001',
          title: 'Aurora Premium Subscription',
          description: 'Access all Aurora features',
          priceCents: 999,
          currency: 'USD',
          url: 'https://aurora.app/products/premium',
          imageUrl: 'https://via.placeholder.com/300x300?text=Premium',
          metadata: { sku: 'AURORA-PREMIUM-001', category: 'subscription' },
        },
        {
          providerId: sampleProviders[1].id,
          externalId: 'prod_aurora_002',
          title: 'Aurora Power User',
          description: 'For professionals and creators',
          priceCents: 1999,
          currency: 'USD',
          url: 'https://aurora.app/products/poweruser',
          imageUrl: 'https://via.placeholder.com/300x300?text=PowerUser',
          metadata: { sku: 'AURORA-POWERUSER-001', category: 'subscription' },
        },
      ])
      .returning();

    console.log(`  ✓ Created ${sampleProducts.length} products`);

    // ========================================================================
    // SEED COMMUNITIES
    // ========================================================================
    console.log('  → Creating communities...');
    const sampleCommunities = await db
      .insert(communities)
      .values([
        {
          name: 'Aurora Creators',
          slug: 'aurora-creators',
          description: 'A community for digital creators and builders',
          visibility: 'public',
        },
        {
          name: 'Learning Hub',
          slug: 'learning-hub',
          description: 'Share knowledge and grow together',
          visibility: 'public',
        },
        {
          name: 'Tech Enthusiasts',
          slug: 'tech-enthusiasts',
          description: 'For tech-savvy Aurora users',
          visibility: 'public',
        },
      ])
      .returning();

    console.log(`  ✓ Created ${sampleCommunities.length} communities`);

    // ========================================================================
    // SEED LEARNING CONTENT
    // ========================================================================
    console.log('  → Creating learning courses...');
    const sampleCourses = await db
      .insert(learningCourses)
      .values([
        {
          source: 'aurora-academy',
          externalId: 'course_001',
          title: 'Getting Started with Aurora',
          description: 'Learn the basics of Aurora platform',
          level: 'beginner',
          metadata: {
            duration: '2 hours',
            lessons: 8,
            instructor: 'Aurora Team',
          },
        },
        {
          source: 'aurora-academy',
          externalId: 'course_002',
          title: 'Advanced Aurora Customization',
          description: 'Master Aurora for professionals',
          level: 'advanced',
          metadata: {
            duration: '6 hours',
            lessons: 24,
            instructor: 'Expert Creators',
          },
        },
        {
          source: 'aurora-academy',
          externalId: 'course_003',
          title: 'Building with Aurora Components',
          description: 'Create custom surfaces and components',
          level: 'intermediate',
          metadata: {
            duration: '4 hours',
            lessons: 16,
            instructor: 'Component Specialists',
          },
        },
      ])
      .returning();

    console.log(`  ✓ Created ${sampleCourses.length} courses`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n✨ Database seeding complete!');
    console.log('📊 Summary:');
    console.log(`   • Users: ${sampleUsers.length}`);
    console.log(`   • Personas: ${samplePersonas.length}`);
    console.log(`   • Brands: ${sampleBrands.length}`);
    console.log(`   • Services: ${sampleServices.length}`);
    console.log(`   • Products: ${sampleProducts.length}`);
    console.log(`   • Communities: ${sampleCommunities.length}`);
    console.log(`   • Courses: ${sampleCourses.length}`);
    console.log('\n🚀 Next steps:');
    console.log('   1. Configure .env.local with DATABASE_URL');
    console.log('   2. Run: npm run db:push');
    console.log('   3. Run: npm run db:seed');
    console.log('   4. Start dev server: npm run dev');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed().then(() => {
  console.log('✅ Done!');
  process.exit(0);
});
