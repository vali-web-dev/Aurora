import {
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgTable,
  uniqueIndex,
  foreignKey,
} from 'drizzle-orm/pg-core';

// ============================================================================
// USERS AND IDENTITY
// ============================================================================

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique(),
    name: varchar('name', { length: 255 }),
    displayName: varchar('display_name', { length: 255 }),
    image: text('image'),
    avatarUrl: text('avatar_url'),
    emailVerified: timestamp('email_verified'),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at').defaultNow(),
  }
);

export const personas = pgTable(
  'personas',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    name: varchar('name', { length: 100 }),
    mode: varchar('mode', { length: 50 }),
    preferences: jsonb('preferences'),
    createdAt: timestamp('created_at').defaultNow(),
  }
);

export const brands = pgTable(
  'brands',
  {
    id: serial('id').primaryKey(),
    ownerUserId: integer('owner_user_id')
      .references(() => users.id)
      .notNull(),
    name: varchar('name', { length: 255 }),
    slug: varchar('slug', { length: 255 }).unique(),
    story: text('story'),
    values: text('values'),
    tone: text('tone'),
    archetype: varchar('archetype', { length: 100 }),
    vocabulary: jsonb('vocabulary'),
    settings: jsonb('settings'),
    createdAt: timestamp('created_at').defaultNow(),
  }
);

// ============================================================================
// SERVICES AND INTEGRATIONS
// ============================================================================

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  homepageUrl: text('homepage_url'),
  embedType: varchar('embed_type', { length: 50 }),
  metadata: jsonb('metadata'),
});

export const serviceIntegrations = pgTable('service_integrations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  serviceId: integer('service_id')
    .references(() => services.id)
    .notNull(),
  authData: jsonb('auth_data'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// SURFACES, BLOCKS, COMPONENTS
// ============================================================================

export const surfaces = pgTable('surfaces', {
  id: serial('id').primaryKey(),
  ownerUserId: integer('owner_user_id')
    .references(() => users.id)
    .notNull(),
  brandId: integer('brand_id').references(() => brands.id),
  title: varchar('title', { length: 255 }),
  type: varchar('type', { length: 100 }),
  status: varchar('status', { length: 50 }),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const blocks = pgTable('blocks', {
  id: serial('id').primaryKey(),
  surfaceId: integer('surface_id')
    .references(() => surfaces.id)
    .notNull(),
  kind: varchar('kind', { length: 100 }),
  position: integer('position'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const components = pgTable('components', {
  id: serial('id').primaryKey(),
  ownerUserId: integer('owner_user_id')
    .references(() => users.id)
    .notNull(),
  brandId: integer('brand_id').references(() => brands.id),
  name: varchar('name', { length: 255 }),
  category: varchar('category', { length: 100 }),
  definition: jsonb('definition'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const surfaceComponents = pgTable('surface_components', {
  id: serial('id').primaryKey(),
  surfaceId: integer('surface_id')
    .references(() => surfaces.id)
    .notNull(),
  componentId: integer('component_id')
    .references(() => components.id)
    .notNull(),
  position: integer('position'),
  config: jsonb('config'),
});

// ============================================================================
// MEDIA AND ENTERTAINMENT
// ============================================================================

export const mediaItems = pgTable('media_items', {
  id: serial('id').primaryKey(),
  ownerUserId: integer('owner_user_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  externalId: varchar('external_id', { length: 255 }),
  title: varchar('title', { length: 255 }),
  type: varchar('type', { length: 50 }),
  url: text('url'),
  thumbnailUrl: text('thumbnail_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const playlists = pgTable('playlists', {
  id: serial('id').primaryKey(),
  ownerUserId: integer('owner_user_id')
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  type: varchar('type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const playlistItems = pgTable('playlist_items', {
  id: serial('id').primaryKey(),
  playlistId: integer('playlist_id')
    .references(() => playlists.id)
    .notNull(),
  mediaItemId: integer('media_item_id')
    .references(() => mediaItems.id)
    .notNull(),
  position: integer('position'),
  addedAt: timestamp('added_at').defaultNow(),
});

// ============================================================================
// COMMERCE
// ============================================================================

export const commerceProviders = pgTable('commerce_providers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  category: varchar('category', { length: 100 }),
  apiInfo: jsonb('api_info'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id')
    .references(() => commerceProviders.id)
    .notNull(),
  externalId: varchar('external_id', { length: 255 }),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  priceCents: integer('price_cents'),
  currency: varchar('currency', { length: 10 }),
  url: text('url'),
  imageUrl: text('image_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id')
    .references(() => carts.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  quantity: integer('quantity'),
  config: jsonb('config'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  cartId: integer('cart_id').references(() => carts.id),
  totalCents: integer('total_cents'),
  currency: varchar('currency', { length: 10 }),
  status: varchar('status', { length: 50 }),
  providerPayload: jsonb('provider_payload'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id)
    .notNull(),
  method: varchar('method', { length: 50 }),
  amountCents: integer('amount_cents'),
  currency: varchar('currency', { length: 10 }),
  status: varchar('status', { length: 50 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// SOCIAL AND COMMUNITIES
// ============================================================================

export const communities = pgTable(
  'communities',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }),
    slug: varchar('slug', { length: 255 }).unique(),
    description: text('description'),
    visibility: varchar('visibility', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
  }
);

export const communityMembers = pgTable('community_members', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id')
    .references(() => communities.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  role: varchar('role', { length: 50 }),
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id')
    .references(() => communities.id)
    .notNull(),
  authorUserId: integer('author_user_id')
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 255 }),
  body: text('body'),
  media: jsonb('media'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => posts.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  kind: varchar('kind', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// LEARNING
// ============================================================================

export const learningCourses = pgTable('learning_courses', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 100 }),
  externalId: varchar('external_id', { length: 255 }),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  level: varchar('level', { length: 50 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const learningLessons = pgTable('learning_lessons', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id')
    .references(() => learningCourses.id)
    .notNull(),
  title: varchar('title', { length: 255 }),
  position: integer('position'),
  mediaItemId: integer('media_item_id').references(() => mediaItems.id),
  metadata: jsonb('metadata'),
});

export const learningProgress = pgTable('learning_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  lessonId: integer('lesson_id')
    .references(() => learningLessons.id)
    .notNull(),
  status: varchar('status', { length: 50 }),
  progressPercent: integer('progress_percent'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
});

// ============================================================================
// AGENTS AND AUTOMATION
// ============================================================================

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 100 }),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 255 }),
  schedule: varchar('schedule', { length: 100 }),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  kind: varchar('kind', { length: 100 }),
  title: varchar('title', { length: 255 }),
  body: text('body'),
  payload: jsonb('payload'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// SETTINGS
// ============================================================================

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  key: varchar('key', { length: 255 }),
  value: jsonb('value'),
});

// ============================================================================
// AUTHENTICATION (NextAuth.js)
// ============================================================================

export const accounts = pgTable(
  'accounts',
  {
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: varchar('token_type', { length: 255 }),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (account) => ({
    compoundKey: uniqueIndex('accounts_provider_provider_account_id_idx').on(
      account.provider,
      account.providerAccountId
    ),
    userIdIdx: uniqueIndex('accounts_user_id_idx').on(account.userId),
  })
);

export const sessions = pgTable(
  'sessions',
  {
    sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    expires: timestamp('expires').notNull(),
  },
  (session) => ({
    userIdIdx: uniqueIndex('sessions_user_id_idx').on(session.userId),
  })
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    email: varchar('email', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires').notNull(),
  },
  (vt) => ({
    compoundKey: uniqueIndex('verification_tokens_email_token_idx').on(vt.email, vt.token),
  })
);

// ============================================================================
// EXPORT ALL TABLES FOR use in db.ts
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Persona = typeof personas.$inferSelect;
export type NewPersona = typeof personas.$inferInsert;

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// ============================================================================
// SOCIAL FEED TABLES (For real-time social features)
// ============================================================================

export const socialPosts = pgTable('social_posts', {
  id: serial('id').primaryKey(),
  authorUserId: integer('author_user_id')
    .references(() => users.id)
    .notNull(),
  universe: varchar('universe', { length: 50 }).notNull().default('social'),
  content: text('content').notNull(),
  visibility: varchar('visibility', { length: 20 }).notNull().default('public'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const socialReactions = pgTable('social_reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => socialPosts.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const socialComments = pgTable('social_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => socialPosts.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type NewSocialPost = typeof socialPosts.$inferInsert;

export type SocialReaction = typeof socialReactions.$inferSelect;
export type NewSocialReaction = typeof socialReactions.$inferInsert;

export type SocialComment = typeof socialComments.$inferSelect;
export type NewSocialComment = typeof socialComments.$inferInsert;

// ============================================================================
// COMMUNITY MESSAGES TABLES (For real-time chat)
// ============================================================================

export const communityMessages = pgTable('community_messages', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id')
    .references(() => communities.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').default({}),
  edited: integer('edited').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type CommunityMessage = typeof communityMessages.$inferSelect;
export type NewCommunityMessage = typeof communityMessages.$inferInsert;
