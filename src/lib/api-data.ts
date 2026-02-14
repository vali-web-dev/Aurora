import { db } from './db';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

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
