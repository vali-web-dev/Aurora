import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * GET /api/users/stats
 * Get current user's dashboard statistics
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get post count
    const postsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.authorUserId, userId));

    // Get community memberships count
    const communitiesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.communityMembers)
      .where(eq(schema.communityMembers.userId, userId));

    // Get messages sent count
    const messagesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.communityMessages)
      .where(eq(schema.communityMessages.userId, userId));

    // Get connections count (users who reacted to or commented on user's posts)
    const connectionsCount = await db
      .select({ count: sql<number>`count(DISTINCT user_id)` })
      .from(schema.socialReactions)
      .innerJoin(
        schema.socialPosts,
        eq(schema.socialReactions.postId, schema.socialPosts.id)
      )
      .where(eq(schema.socialPosts.authorUserId, userId));

    return NextResponse.json({
      posts: Number(postsCount[0]?.count || 0),
      communities: Number(communitiesCount[0]?.count || 0),
      messages: Number(messagesCount[0]?.count || 0),
      connections: Number(connectionsCount[0]?.count || 0),
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
