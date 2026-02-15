import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/users/seed-sample-data
 * Seeds sample data for the current user to populate their dashboard
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Check if user already has data
    const existingPosts = await db
      .select()
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.authorUserId, userId))
      .limit(1);

    if (existingPosts.length > 0) {
      return NextResponse.json({
        message: 'You already have data. Clear it first if you want to reseed.',
        alreadySeeded: true,
      });
    }

    // Create sample social posts
    const samplePosts = [
      {
        authorUserId: userId,
        universe: 'social',
        content: 'Welcome to Aurora! 🌟 Excited to explore this unified digital civilization platform.',
        visibility: 'public' as const,
        metadata: { tags: ['welcome', 'aurora', 'introduction'] },
      },
      {
        authorUserId: userId,
        universe: 'entertainment',
        content: 'Just discovered an amazing playlist on the Entertainment Universe 🎵 The music recommendations here are spot on!',
        visibility: 'public' as const,
        metadata: { tags: ['entertainment', 'music', 'discovery'] },
      },
      {
        authorUserId: userId,
        universe: 'learning',
        content: 'Started a new course on web development 📚 The Learning Universe makes education so accessible!',
        visibility: 'public' as const,
        metadata: { tags: ['learning', 'education', 'development'] },
      },
      {
        authorUserId: userId,
        universe: 'productivity',
        content: 'Organizing my tasks for the week 📊 Love how everything integrates seamlessly across universes.',
        visibility: 'public' as const,
        metadata: { tags: ['productivity', 'organization', 'tasks'] },
      },
      {
        authorUserId: userId,
        universe: 'social',
        content: 'The Aurora Companion AI is incredibly helpful! It\'s like having a personal assistant that knows all your digital preferences 🤖',
        visibility: 'public' as const,
        metadata: { tags: ['ai', 'companion', 'technology'] },
      },
    ];

    const insertedPosts = await db
      .insert(schema.socialPosts)
      .values(samplePosts)
      .returning();

    // Create sample communities
    const techCommunity = await db
      .insert(schema.communities)
      .values({
        name: 'Tech Enthusiasts',
        slug: `tech-enthusiasts-${userId}`,
        description: 'A community for technology lovers and innovators',
        visibility: 'public',
      })
      .returning();

    const creativeCommunity = await db
      .insert(schema.communities)
      .values({
        name: 'Creative Minds',
        slug: `creative-minds-${userId}`,
        description: 'Share your creative projects and get inspired',
        visibility: 'public',
      })
      .returning();

    // Join the communities
    await db.insert(schema.communityMembers).values([
      {
        userId,
        communityId: techCommunity[0].id,
        role: 'owner',
      },
      {
        userId,
        communityId: creativeCommunity[0].id,
        role: 'owner',
      },
    ]);

    // Send sample messages
    await db.insert(schema.communityMessages).values([
      {
        communityId: techCommunity[0].id,
        userId,
        content: 'Welcome everyone! Let\'s share knowledge and grow together 🚀',
        metadata: { type: 'announcement' },
      },
      {
        communityId: creativeCommunity[0].id,
        userId,
        content: 'Excited to see all the amazing creative work you\'ll share here! 🎨',
        metadata: { type: 'announcement' },
      },
    ]);

    // Add some sample reactions to posts
    if (insertedPosts.length > 0) {
      await db.insert(schema.socialReactions).values([
        {
          postId: insertedPosts[0].id,
          userId,
          emoji: '👍',
        },
        {
          postId: insertedPosts[1].id,
          userId,
          emoji: '❤️',
        },
      ]);
    }

    return NextResponse.json({
      message: 'Sample data created successfully!',
      created: {
        posts: insertedPosts.length,
        communities: 2,
        messages: 2,
        reactions: 2,
      },
    });
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return NextResponse.json(
      { error: 'Failed to seed sample data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
