import { z } from 'zod';

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const userProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  displayName: z.string().min(1, 'Display name is required').max(255).optional(),
}).refine((data) => data.name || data.displayName, {
  message: 'At least one field (name or displayName) must be provided',
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================================================
// PRODUCT & COMMERCE SCHEMAS
// ============================================================================

export const productCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').optional(),
  priceCents: z.number().int().positive('Price must be positive'),
  currency: z.string().length(3).default('USD'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// ============================================================================
// SOCIAL & POST SCHEMAS
// ============================================================================

export const postCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  body: z.string().min(1, 'Post body is required').max(5000),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'link']),
  })).optional(),
});

export const postUpdateSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1).max(5000).optional(),
  visibility: z.enum(['public', 'private', 'friends']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const reactionCreateSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  emoji: z.string().min(1, 'Emoji is required').max(10),
});

export const commentCreateSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1, 'Comment content is required').max(1000),
});

// ============================================================================
// LEARNING & COURSE SCHEMAS
// ============================================================================

export const courseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(2000),
  category: z.string().max(100).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export const lessonCreateSchema = z.object({
  courseId: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  order: z.number().int().nonnegative().optional(),
});

export const lessonUpdateSchema = lessonCreateSchema.partial();

// ============================================================================
// COMMUNITIES & MEMBER SCHEMAS
// ============================================================================

export const communityCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1, 'Description is required').max(2000),
  visibility: z.enum(['public', 'private']).default('public'),
});

export const communityUpdateSchema = communityCreateSchema.partial();

export const communityMemberCreateSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['member', 'moderator', 'admin']).default('member'),
});

// ============================================================================
// BRAND SCHEMAS
// ============================================================================

export const brandCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  story: z.string().min(10, 'Story must be at least 10 characters').max(2000).optional(),
  values: z.string().max(2000).optional(),
  tone: z.string().max(500).optional(),
  archetype: z.string().max(100).optional(),
});

export const brandUpdateSchema = brandCreateSchema.partial();

// ============================================================================
// PLAYLIST & ENTERTAINMENT SCHEMAS
// ============================================================================

export const playlistCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  type: z.enum(['playlist', 'watch-later', 'favorites']).default('playlist'),
});

export const playlistUpdateSchema = playlistCreateSchema.partial();

export const playlistItemCreateSchema = z.object({
  mediaItemId: z.number().int().positive(),
  position: z.number().int().nonnegative().optional(),
});

// ============================================================================
// SERVICE & INTEGRATION SCHEMAS
// ============================================================================

export const serviceCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(2000).optional(),
  homepageUrl: z.string().url('Invalid URL').optional(),
  embedType: z.enum(['iframe', 'widget', 'api', 'webhook']).optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const filterSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

// Type exports for use in components
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type PostCreate = z.infer<typeof postCreateSchema>;
export type CourseCreate = z.infer<typeof courseCreateSchema>;
export type CommunityCreate = z.infer<typeof communityCreateSchema>;
export type BrandCreate = z.infer<typeof brandCreateSchema>;
export type PlaylistCreate = z.infer<typeof playlistCreateSchema>;
