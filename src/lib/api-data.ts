import { db } from './db';
import * as schema from './schema';
import { eq, and } from 'drizzle-orm';

function resolveAuthorName(author: {
  name: string | null;
  displayName: string | null;
  email: string | null;
}) {
  if (author.displayName) return author.displayName;
  if (author.name) return author.name;
  if (author.email) return author.email.split('@')[0];
  return 'Unknown User';
}

/**
 * Personas data access
 */
export async function getPersonas(userId: number) {
  return await db
    .select()
    .from(schema.personas)
    .where(eq(schema.personas.userId, userId));
}

export async function getPersona(id: number) {
  const [persona] = await db
    .select()
    .from(schema.personas)
    .where(eq(schema.personas.id, id));
  return persona;
}

/**
 * Brands data access
 */
export async function getBrands(userId?: number) {
  if (userId) {
    return await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.ownerUserId, userId));
  }
  return await db.select().from(schema.brands);
}

export async function getBrand(id: number) {
  const [brand] = await db
    .select()
    .from(schema.brands)
    .where(eq(schema.brands.id, id));
  return brand;
}

/**
 * Services data access
 */
export async function getServices() {
  return await db.select().from(schema.services);
}

export async function getService(id: number) {
  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, id));
  return service;
}

/**
 * Products data access
 */
export async function getProducts() {
  return await db.select().from(schema.products);
}

export async function getProduct(id: number) {
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id));
  return product;
}

/**
 * Communities data access
 */
export async function getCommunities() {
  return await db.select().from(schema.communities);
}

export async function getCommunity(id: number) {
  const [community] = await db
    .select()
    .from(schema.communities)
    .where(eq(schema.communities.id, id));
  return community;
}

export async function getCommunityMembers(communityId: number) {
  return await db
    .select()
    .from(schema.communityMembers)
    .where(eq(schema.communityMembers.communityId, communityId));
}

/**
 * Learning courses data access
 */
export async function getCourses() {
  return await db.select().from(schema.learningCourses);
}

export async function getCourse(id: number) {
  const [course] = await db
    .select()
    .from(schema.learningCourses)
    .where(eq(schema.learningCourses.id, id));
  return course;
}

export async function getLessons(courseId: number) {
  return await db
    .select()
    .from(schema.learningLessons)
    .where(eq(schema.learningLessons.courseId, courseId));
}

/**
 * Posts/Social data access
 */
export async function getPosts() {
  return await db
    .select()
    .from(schema.posts)
    .orderBy(schema.posts.createdAt);
}

export async function getPost(id: number) {
  const [post] = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, id));
  return post;
}

export async function getPostsByUser(userId: number) {
  return await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.authorUserId, userId))
    .orderBy(schema.posts.createdAt);
}

/**
 * Playlists and Media
 */
export async function getPlaylists(userId?: number) {
  if (userId) {
    return await db
      .select()
      .from(schema.playlists)
      .where(eq(schema.playlists.ownerUserId, userId));
  }
  return await db.select().from(schema.playlists);
}

export async function getPlaylist(id: number) {
  const [playlist] = await db
    .select()
    .from(schema.playlists)
    .where(eq(schema.playlists.id, id));
  return playlist;
}

export async function getPlaylistItems(playlistId: number) {
  return await db
    .select()
    .from(schema.playlistItems)
    .where(eq(schema.playlistItems.playlistId, playlistId));
}

/**
 * Orders and Commerce
 */
export async function getOrders(userId: number) {
  return await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId));
}

export async function getOrder(id: number) {
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id));
  return order;
}

export async function getCart(cartId: number) {
  return await db
    .select()
    .from(schema.cartItems)
    .where(eq(schema.cartItems.cartId, cartId));
}

// ============================================================================
// SOCIAL FEED FUNCTIONS
// ============================================================================

/**
 * Get feed posts for a universe
 */
export async function getFeedPosts(universe: string, limit: number = 50, offset: number = 0) {
  const rows = await db
    .select({
      post: schema.socialPosts,
      author: {
        id: schema.users.id,
        name: schema.users.name,
        displayName: schema.users.displayName,
        email: schema.users.email,
      },
    })
    .from(schema.socialPosts)
    .leftJoin(schema.users, eq(schema.socialPosts.authorUserId, schema.users.id))
    .where(eq(schema.socialPosts.universe, universe))
    .orderBy(schema.socialPosts.createdAt)
    .limit(limit)
    .offset(offset);

  return rows.map((row) => ({
    ...row.post,
    author: row.author?.id
      ? {
          id: row.author.id.toString(),
          name: resolveAuthorName(row.author),
          email: row.author.email ?? '',
        }
      : undefined,
  }));
}

/**
 * Get post by ID
 */
export async function getPostById(postId: number) {
  const [post] = await db
    .select()
    .from(schema.socialPosts)
    .where(eq(schema.socialPosts.id, postId));
  return post;
}

/**
 * Create a new post
 */
export async function createPost(data: {
  userId: number;
  universe: string;
  content: string;
  visibility: string;
  metadata: Record<string, any>;
}) {
  const [post] = await db
    .insert(schema.socialPosts)
    .values({
      authorUserId: data.userId,
      universe: data.universe,
      content: data.content,
      visibility: data.visibility,
      metadata: data.metadata,
    })
    .returning();
  return post;
}

/**
 * Update a post
 */
export async function updatePost(
  postId: number,
  data: {
    content?: string;
    visibility?: string;
    metadata?: Record<string, any>;
  }
) {
  const [post] = await db
    .update(schema.socialPosts)
    .set({
      content: data.content,
      visibility: data.visibility,
      metadata: data.metadata,
      updatedAt: new Date(),
    })
    .where(eq(schema.socialPosts.id, postId))
    .returning();
  return post;
}

/**
 * Delete a post
 */
export async function deletePost(postId: number) {
  await db.delete(schema.socialPosts).where(eq(schema.socialPosts.id, postId));
}

// ============================================================================
// REACTIONS FUNCTIONS
// ============================================================================

/**
 * Get reactions for a post
 */
export async function getPostReactions(postId: number) {
  return await db
    .select()
    .from(schema.socialReactions)
    .where(eq(schema.socialReactions.postId, postId));
}

/**
 * Create a reaction
 */
export async function createReaction(data: {
  postId: number;
  userId: number;
  emoji: string;
}) {
  await db
    .delete(schema.socialReactions)
    .where(
      and(
        eq(schema.socialReactions.postId, data.postId),
        eq(schema.socialReactions.userId, data.userId)
      )
    );
  const [reaction] = await db
    .insert(schema.socialReactions)
    .values({
      postId: data.postId,
      userId: data.userId,
      emoji: data.emoji,
    })
    .returning();
  return reaction;
}

/**
 * Delete a reaction
 */
export async function deleteReaction(
  postId: number,
  userId: number,
  emoji: string
) {
  await db
    .delete(schema.socialReactions)
    .where(
      and(
        eq(schema.socialReactions.postId, postId),
        eq(schema.socialReactions.userId, userId),
        eq(schema.socialReactions.emoji, emoji)
      )
    );
}

// ============================================================================
// COMMENTS FUNCTIONS
// ============================================================================

/**
 * Get comments for a post
 */
export async function getPostComments(postId: number) {
  const rows = await db
    .select({
      comment: schema.socialComments,
      author: {
        id: schema.users.id,
        name: schema.users.name,
        displayName: schema.users.displayName,
        email: schema.users.email,
      },
    })
    .from(schema.socialComments)
    .leftJoin(schema.users, eq(schema.socialComments.userId, schema.users.id))
    .where(eq(schema.socialComments.postId, postId))
    .orderBy(schema.socialComments.createdAt);

  return rows.map((row) => ({
    ...row.comment,
    author: row.author?.id
      ? {
          id: row.author.id.toString(),
          name: resolveAuthorName(row.author),
        }
      : undefined,
  }));
}

/**
 * Create a comment
 */
export async function createComment(data: {
  postId: number;
  userId: number;
  content: string;
  parentCommentId?: number;
}) {
  const [comment] = await db
    .insert(schema.socialComments)
    .values({
      postId: data.postId,
      userId: data.userId,
      content: data.content,
      parentCommentId: data.parentCommentId,
    })
    .returning();
  return comment;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: number) {
  await db.delete(schema.socialComments).where(eq(schema.socialComments.id, commentId));
}

/**
 * Get reactions for a comment
 */
export async function getCommentReactions(commentId: number) {
  return await db
    .select()
    .from(schema.socialCommentReactions)
    .where(eq(schema.socialCommentReactions.commentId, commentId));
}

/**
 * Create a reaction for a comment
 */
export async function createCommentReaction(data: {
  commentId: number;
  userId: number;
  emoji: string;
}) {
  await db
    .delete(schema.socialCommentReactions)
    .where(
      and(
        eq(schema.socialCommentReactions.commentId, data.commentId),
        eq(schema.socialCommentReactions.userId, data.userId)
      )
    );
  const [reaction] = await db
    .insert(schema.socialCommentReactions)
    .values({
      commentId: data.commentId,
      userId: data.userId,
      emoji: data.emoji,
    })
    .returning();
  return reaction;
}

/**
 * Delete a reaction for a comment
 */
export async function deleteCommentReaction(
  commentId: number,
  userId: number,
  emoji: string
) {
  await db
    .delete(schema.socialCommentReactions)
    .where(
      and(
        eq(schema.socialCommentReactions.commentId, commentId),
        eq(schema.socialCommentReactions.userId, userId),
        eq(schema.socialCommentReactions.emoji, emoji)
      )
    );
}

// ============================================================================
// COMMUNITY MESSAGES FUNCTIONS
// ============================================================================

/**
 * Get messages for a community
 */
export async function getCommunityMessages(
  communityId: number,
  limit: number = 100,
  offset: number = 0
) {
  return await db
    .select()
    .from(schema.communityMessages)
    .where(eq(schema.communityMessages.communityId, communityId))
    .orderBy(schema.communityMessages.createdAt)
    .limit(limit)
    .offset(offset);
}

/**
 * Create a message
 */
export async function createMessage(data: {
  communityId: number;
  userId: number;
  content: string;
  metadata: Record<string, any>;
}) {
  const [message] = await db
    .insert(schema.communityMessages)
    .values({
      communityId: data.communityId,
      userId: data.userId,
      content: data.content,
      metadata: data.metadata,
    })
    .returning();
  return message;
}

/**
 * Update a message
 */
export async function updateMessage(
  messageId: number,
  data: {
    content: string;
    edited: boolean;
  }
) {
  const [message] = await db
    .update(schema.communityMessages)
    .set({
      content: data.content,
      edited: data.edited ? 1 : 0,
      updatedAt: new Date(),
    })
    .where(eq(schema.communityMessages.id, messageId))
    .returning();
  return message;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: number) {
  await db.delete(schema.communityMessages).where(eq(schema.communityMessages.id, messageId));
}
