import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq, desc, or, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/activity
 * Get current user's recent activity feed
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get recent posts
    const recentPosts = await db
      .select({
        id: schema.socialPosts.id,
        type: sql<string>`'post'`,
        content: schema.socialPosts.content,
        createdAt: schema.socialPosts.createdAt,
        universe: schema.socialPosts.universe,
      })
      .from(schema.socialPosts)
      .where(eq(schema.socialPosts.authorUserId, userId))
      .orderBy(desc(schema.socialPosts.createdAt))
      .limit(3);

    // Get recent community joins
    const recentCommunities = await db
      .select({
        id: schema.communityMembers.id,
        type: sql<string>`'community_join'`,
        communityName: schema.communities.name,
        communityId: schema.communities.id,
        createdAt: schema.communityMembers.joinedAt,
      })
      .from(schema.communityMembers)
      .innerJoin(
        schema.communities,
        eq(schema.communityMembers.communityId, schema.communities.id)
      )
      .where(eq(schema.communityMembers.userId, userId))
      .orderBy(desc(schema.communityMembers.joinedAt))
      .limit(2);

    // Get recent messages
    const recentMessages = await db
      .select({
        id: schema.communityMessages.id,
        type: sql<string>`'message'`,
        content: schema.communityMessages.content,
        communityName: schema.communities.name,
        createdAt: schema.communityMessages.createdAt,
      })
      .from(schema.communityMessages)
      .innerJoin(
        schema.communities,
        eq(schema.communityMessages.communityId, schema.communities.id)
      )
      .where(eq(schema.communityMessages.userId, userId))
      .orderBy(desc(schema.communityMessages.createdAt))
      .limit(2);

    // Combine and sort all activities
    const allActivities = [
      ...recentPosts.map((p) => ({
        id: `post-${p.id}`,
        type: 'post' as const,
        title: 'Created a post',
        description: p.content?.substring(0, 100) || '',
        universe: p.universe,
        timestamp: p.createdAt || new Date(),
      })),
      ...recentCommunities.map((c) => ({
        id: `community-${c.id}`,
        type: 'community_join' as const,
        title: `Joined ${c.communityName}`,
        description: 'New community member',
        communityId: c.communityId,
        timestamp: c.createdAt || new Date(),
      })),
      ...recentMessages.map((m) => ({
        id: `message-${m.id}`,
        type: 'message' as const,
        title: `Sent message in ${m.communityName}`,
        description: m.content?.substring(0, 100) || '',
        timestamp: m.createdAt || new Date(),
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    return NextResponse.json({
      activities: allActivities,
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
