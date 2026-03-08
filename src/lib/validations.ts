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

const notificationPrefsSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    messageNotifications: z.boolean().optional(),
    mentionNotifications: z.boolean().optional(),
  })
  .strict();

const privacyPrefsSchema = z
  .object({
    profileVisibility: z.enum(['public', 'private']).optional(),
    showEmail: z.boolean().optional(),
    showActivity: z.boolean().optional(),
  })
  .strict();

const profileExtrasSchema = z
  .object({
    bio: z.string().max(1000).optional(),
    location: z.string().max(255).optional(),
    website: z.string().url('Invalid website URL').max(500).optional(),
  })
  .strict();

export const userSettingsUpdateSchema = z
  .object({
    notifications: notificationPrefsSchema.optional(),
    privacy: privacyPrefsSchema.optional(),
    profile: profileExtrasSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Boolean(data.notifications || data.privacy || data.profile),
    {
      message: 'At least one settings group must be provided',
      path: [],
    }
  );

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
  content: z.string().min(1, 'Post content is required').max(5000),
  universe: z.string().min(1).max(50).optional(),
  visibility: z.enum(['public', 'private', 'friends']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const postUpdateSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1).max(5000).optional(),
  visibility: z.enum(['public', 'private', 'friends']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const reactionCreateSchema = z.object({
  postId: z.coerce.number().int().positive('Post ID is required'),
  emoji: z.string().min(1, 'Emoji is required').max(10),
});

export const commentCreateSchema = z.object({
  postId: z.coerce.number().int().positive('Post ID is required'),
  parentCommentId: z.coerce.number().int().positive().optional(),
  content: z.string().min(1, 'Comment content is required').max(1000),
});

export const commentReactionCreateSchema = z.object({
  commentId: z.coerce.number().int().positive('Comment ID is required'),
  emoji: z.string().min(1, 'Emoji is required').max(10),
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

export const messageCreateSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000),
  metadata: z.record(z.string(), z.any()).optional(),
  mentions: z.array(z.string()).optional(),
});

export const messageUpdateSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  content: z.string().min(1, 'Message content is required').max(5000),
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
// PAYMENTS SCHEMAS
// ============================================================================

const paymentProviderSchema = z.enum(['stripe', 'adyen']);

export const paymentIntentCreateSchema = z.object({
  amount: z.coerce.number().int().positive('Amount must be a positive integer'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').transform((v) => v.toUpperCase()),
  metadata: z.record(z.string(), z.unknown()).optional(),
  provider: paymentProviderSchema.optional(),
});

export const paymentIntentRetrieveQuerySchema = z.object({
  id: z.string().min(1, 'Intent ID is required'),
  provider: paymentProviderSchema.optional(),
});

export const paymentMethodsListQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  provider: paymentProviderSchema.optional(),
});

export const paymentMethodSaveSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  paymentMethodData: z.record(z.string(), z.unknown()),
  provider: paymentProviderSchema.optional(),
});

export const paymentMethodDeleteQuerySchema = z.object({
  id: z.string().min(1, 'Payment method ID is required'),
  provider: paymentProviderSchema.optional(),
});

export const paymentConfirmSchema = z.object({
  intentId: z.string().min(1, 'Intent ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
  provider: paymentProviderSchema.optional(),
});

export const paymentRefundSchema = z.object({
  chargeId: z.string().min(1, 'Charge ID is required'),
  amount: z.coerce.number().int().positive('Refund amount must be positive').optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer', 'other']).optional(),
  provider: paymentProviderSchema.optional(),
});

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

const analyticsCategorySchema = z.enum([
  'commerce',
  'payment',
  'fulfillment',
  'user',
  'system',
  'performance',
  'error',
]);

const analyticsActionSchema = z.enum([
  'browse_products',
  'view_product',
  'add_to_cart',
  'remove_from_cart',
  'view_cart',
  'start_checkout',
  'complete_checkout',
  'create_payment_intent',
  'confirm_payment',
  'payment_success',
  'payment_failed',
  'refund_initiated',
  'refund_completed',
  'shipment_created',
  'tracking_updated',
  'delivery_confirmed',
  'return_initiated',
  'sign_up',
  'sign_in',
  'sign_out',
  'profile_updated',
  'api_call',
  'page_load',
  'error_occurred',
  'performance_metric',
]);

const analyticsEventInputSchema = z.object({
  timestamp: z.coerce.date().optional(),
  category: analyticsCategorySchema,
  action: analyticsActionSchema,
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  orderId: z.string().optional(),
  productId: z.string().optional(),
  value: z.coerce.number().int().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const analyticsEventsPostSchema = z
  .object({
    events: analyticsEventInputSchema.optional(),
    batch: z.array(analyticsEventInputSchema).min(1).optional(),
  })
  .refine((data) => Boolean(data.events || data.batch), {
    message: 'Events or batch data required',
    path: [],
  });

export const analyticsEventsQuerySchema = z.object({
  category: analyticsCategorySchema.optional(),
  action: analyticsActionSchema.optional(),
  userId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(1000).default(100),
  days: z.coerce.number().int().positive().max(365).default(7),
});

export const analyticsMetricsQuerySchema = z.object({
  category: analyticsCategorySchema.optional(),
  action: analyticsActionSchema.optional(),
});

// ============================================================================
// INVOICE SCHEMAS
// ============================================================================

export const invoiceCreateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  orderData: z
    .object({
      customerEmail: z.string().email().optional(),
    })
    .catchall(z.unknown()),
});

export const invoicesListQuerySchema = z.object({
  customerId: z.string().min(1, 'Customer ID required'),
});

// ============================================================================
// FULFILLMENT SCHEMAS
// ============================================================================

const carrierSchema = z.enum(['fedex', 'ups', 'dhl']);

const packageSchema = z.object({
  weight: z.coerce.number().positive(),
  length: z.coerce.number().positive(),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  value: z.coerce.number().nonnegative(),
});

const addressSchema = z.object({
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  state: z.string().min(1).max(100),
  zip: z.string().min(1).max(20),
  country: z.string().min(2).max(2),
});

export const fulfillmentShipmentCreateSchema = z.object({
  orderId: z.string().min(1),
  carrier: carrierSchema,
  recipientName: z.string().min(1).max(255),
  recipientEmail: z.string().email().optional(),
  shipmentAddress: addressSchema,
  packages: z.array(packageSchema).min(1),
  shippingMethod: z.enum(['standard', 'overnight', 'express']).optional(),
});

export const fulfillmentRatesRequestSchema = z.object({
  origin: z.object({
    zip: z.string().min(1).max(20),
    country: z.string().min(2).max(2),
  }),
  destination: z.object({
    zip: z.string().min(1).max(20),
    country: z.string().min(2).max(2),
    state: z.string().min(1).max(100),
  }),
  weight: z.coerce.number().positive(),
  dimensions: z
    .object({
      length: z.coerce.number().positive().optional(),
      width: z.coerce.number().positive().optional(),
      height: z.coerce.number().positive().optional(),
    })
    .optional(),
  carriers: z.array(carrierSchema).nonempty().optional(),
});

export const fulfillmentReturnSchema = z.object({
  trackingNumber: z.string().min(1).max(64),
  carrier: carrierSchema.optional(),
  reason: z.string().max(1000).optional(),
});

export const fulfillmentTrackingQuerySchema = z.object({
  trackingNumber: z.string().min(1).max(64),
  carrier: carrierSchema.optional(),
});

export const fulfillmentShipmentsQuerySchema = z.object({
  orderId: z.string().min(1).max(100),
});

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
