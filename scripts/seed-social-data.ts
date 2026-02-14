/**
 * Aurora Social Universe - Seed Data Script (TypeScript/Node.js)
 * 
 * This script populates the social universe with test data
 * Run with: npx tsx scripts/seed-social-data.ts
 * Or: ts-node scripts/seed-social-data.ts
 */

import { db } from '../src/lib/db';
import * as schema from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function seedSocialUniverse() {
  console.log('🌱 Starting Social Universe seed...\n');

  try {
    // Check if users exist
    const users = await db.select().from(schema.users).limit(1);
    
    if (users.length === 0) {
      console.error('❌ No users found. Please create a user account first.');
      console.log('   Run: npm run dev → Navigate to /auth/signup');
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`✅ Found user: ${users[0].name} (ID: ${userId})\n`);

    // Sample posts data
    const postsData = [
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Welcome to the Aurora Social Universe! 🌟 This is where all conversations, connections, and communities come together in one unified experience.',
        visibility: 'public',
        metadata: { tags: ['welcome', 'aurora', 'introduction'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Just launched my new project on Aurora Forge! 🚀 It\'s a task management tool with real-time collaboration. Check it out and let me know what you think!',
        visibility: 'public',
        metadata: { tags: ['forge', 'project', 'launch'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Learning something amazing today in the Learning Universe 📚 Currently diving deep into TypeScript advanced patterns. The type system is incredibly powerful!',
        visibility: 'public',
        metadata: { tags: ['learning', 'typescript', 'development'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'The Aurora Communities feature is game-changing! Finally, a place where all my interest groups can thrive without platform fragmentation. 🎉',
        visibility: 'public',
        metadata: { tags: ['communities', 'social', 'unity'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Exploring the Travel Universe and planning my next adventure 🗺️ The AI-powered recommendations are spot-on. Who else is planning trips this year?',
        visibility: 'public',
        metadata: { tags: ['travel', 'adventure', 'planning'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Started my morning routine with the Health & Wellness Universe 🧘‍♀️ The mindfulness exercises are really helping me stay focused throughout the day.',
        visibility: 'public',
        metadata: { tags: ['health', 'wellness', 'mindfulness'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Binge-watching mode activated in the Entertainment Universe 📺 The content curation here is absolutely fantastic. Just discovered some hidden gems!',
        visibility: 'public',
        metadata: { tags: ['entertainment', 'movies', 'content'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Productivity tip: Aurora\'s automation features just saved me 3 hours today ⚡ Setting up workflows between universes is ridiculously easy.',
        visibility: 'public',
        metadata: { tags: ['productivity', 'automation', 'tips'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Quick question: What\'s your favorite Aurora universe and why? I\'m curious to see how everyone is using the platform 🤔',
        visibility: 'public',
        metadata: { tags: ['question', 'discussion', 'community'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Just hit 100 completed tasks in the Productivity Universe! 🎯 The gamification features really keep me motivated. Here\'s to the next 100!',
        visibility: 'public',
        metadata: { tags: ['productivity', 'achievement', 'motivation'] },
      },
    ];

    // Insert posts
    console.log('📝 Creating posts...');
    const createdPosts = await db
      .insert(schema.socialPosts)
      .values(postsData)
      .returning();
    
    console.log(`✅ Created ${createdPosts.length} posts\n`);

    // Comments data mapped to posts
    const commentsData = [
      // Comments on first post (welcome)
      { postId: createdPosts[0].id, userId, content: 'This is incredible! The unified experience is exactly what I\'ve been looking for.' },
      { postId: createdPosts[0].id, userId, content: 'Love the concept of bringing everything together!' },
      { postId: createdPosts[0].id, userId, content: 'Can\'t wait to explore all the features 🚀' },
      
      // Comments on second post (project)
      { postId: createdPosts[1].id, userId, content: 'Congratulations on the launch! 🎉' },
      { postId: createdPosts[1].id, userId, content: 'Just checked it out - fantastic work!' },
      { postId: createdPosts[1].id, userId, content: 'Would love to collaborate on this!' },
      
      // Comments on third post (learning)
      { postId: createdPosts[2].id, userId, content: 'TypeScript is amazing once you get past the learning curve!' },
      { postId: createdPosts[2].id, userId, content: 'Any good resources you\'d recommend?' },
      
      // Comments on fourth post (communities)
      { postId: createdPosts[3].id, userId, content: 'Totally agree! The integration is seamless.' },
      { postId: createdPosts[3].id, userId, content: 'Which communities are you most active in?' },
      
      // Comments on fifth post (travel)
      { postId: createdPosts[4].id, userId, content: 'Where are you planning to go?' },
      { postId: createdPosts[4].id, userId, content: 'I\'m planning a trip to Japan next month!' },
      
      // Comments on sixth post (wellness)
      { postId: createdPosts[5].id, userId, content: 'Mindfulness is so important! Keep it up!' },
      { postId: createdPosts[5].id, userId, content: 'What exercises do you recommend for beginners?' },
      
      // Comments on seventh post (entertainment)
      { postId: createdPosts[6].id, userId, content: 'What are some of the hidden gems you found?' },
      { postId: createdPosts[6].id, userId, content: 'I\'m always looking for new recommendations!' },
      
      // Comments on eighth post (productivity)
      { postId: createdPosts[7].id, userId, content: 'Wow, 3 hours saved is impressive!' },
      { postId: createdPosts[7].id, userId, content: 'Can you share your workflow setup?' },
      
      // Comments on ninth post (question)
      { postId: createdPosts[8].id, userId, content: 'Learning Universe is my favorite - the structured courses are amazing!' },
      { postId: createdPosts[8].id, userId, content: 'I spend most time in Communities - the people here are incredible.' },
      { postId: createdPosts[8].id, userId, content: 'Forge Universe for me - I love building and creating!' },
      
      // Comments on tenth post (achievement)
      { postId: createdPosts[9].id, userId, content: 'Congrats! That\'s impressive! 🎉' },
      { postId: createdPosts[9].id, userId, content: 'The gamification really does work!' },
    ];

    // Insert comments
    console.log('💬 Creating comments...');
    const createdComments = await db
      .insert(schema.socialComments)
      .values(commentsData)
      .returning();
    
    console.log(`✅ Created ${createdComments.length} comments\n`);

    // Reactions data
    const reactionsData = [
      // Welcome post reactions
      { postId: createdPosts[0].id, userId, emoji: '❤️' },
      { postId: createdPosts[0].id, userId, emoji: '🎉' },
      
      // Project launch reactions
      { postId: createdPosts[1].id, userId, emoji: '🎉' },
      { postId: createdPosts[1].id, userId, emoji: '👍' },
      
      // Learning post reactions
      { postId: createdPosts[2].id, userId, emoji: '👍' },
      { postId: createdPosts[2].id, userId, emoji: '❤️' },
      
      // Communities post reactions
      { postId: createdPosts[3].id, userId, emoji: '❤️' },
      { postId: createdPosts[3].id, userId, emoji: '🎉' },
      
      // Travel post reactions
      { postId: createdPosts[4].id, userId, emoji: '❤️' },
      { postId: createdPosts[4].id, userId, emoji: '🎉' },
      
      // Wellness post reactions
      { postId: createdPosts[5].id, userId, emoji: '❤️' },
      { postId: createdPosts[5].id, userId, emoji: '👍' },
      
      // Entertainment post reactions
      { postId: createdPosts[6].id, userId, emoji: '❤️' },
      { postId: createdPosts[6].id, userId, emoji: '😂' },
      
      // Productivity post reactions
      { postId: createdPosts[7].id, userId, emoji: '🎉' },
      { postId: createdPosts[7].id, userId, emoji: '👍' },
      
      // Question post reactions
      { postId: createdPosts[8].id, userId, emoji: '🤔' },
      { postId: createdPosts[8].id, userId, emoji: '👍' },
      
      // Achievement post reactions
      { postId: createdPosts[9].id, userId, emoji: '🎉' },
      { postId: createdPosts[9].id, userId, emoji: '❤️' },
    ];

    // Insert reactions
    console.log('❤️  Creating reactions...');
    const createdReactions = await db
      .insert(schema.socialReactions)
      .values(reactionsData)
      .returning();
    
    console.log(`✅ Created ${createdReactions.length} reactions\n`);

    // Summary
    console.log('=' .repeat(50));
    console.log('🎉 Seed completed successfully!\n');
    console.log('Summary:');
    console.log(`  📝 Posts: ${createdPosts.length}`);
    console.log(`  💬 Comments: ${createdComments.length}`);
    console.log(`  ❤️  Reactions: ${createdReactions.length}`);
    console.log('=' .repeat(50));
    console.log('\n✨ Visit /social to see your populated feed!\n');

  } catch (error) {
    console.error('❌ Error seeding Social Universe:', error);
    process.exit(1);
  }
}

// Cleanup function (optional - run separately to remove seed data)
async function cleanupSeedData() {
  console.log('🧹 Cleaning up seed data...\n');

  try {
    const users = await db.select().from(schema.users).limit(1);
    if (users.length === 0) {
      console.log('No users found, nothing to clean up.');
      return;
    }

    const userId = users[0].id;

    // Get all posts by this user
    const posts = await db
      .select()
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.authorUserId, userId));

    // Delete reactions
    for (const post of posts) {
      await db
        .delete(schema.socialReactions)
        .where(eq(schema.socialReactions.postId, post.id));
    }

    // Delete comments
    for (const post of posts) {
      await db
        .delete(schema.socialComments)
        .where(eq(schema.socialComments.postId, post.id));
    }

    // Delete posts
    await db
      .delete(schema.socialPosts)
      .where(eq(schema.socialPosts.authorUserId, userId));

    console.log('✅ Cleanup completed!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanupSeedData();
} else {
  seedSocialUniverse();
}
