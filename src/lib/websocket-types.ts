/**
 * WebSocket Message Types
 * Defines all real-time events across Aurora's 15 universes
 */

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export enum WSEventType {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  ERROR = 'error',

  // Notifications & Presence
  NOTIFICATION = 'notification',
  PRESENCE_UPDATE = 'presence:update',
  PRESENCE_ONLINE = 'presence:online',
  PRESENCE_OFFLINE = 'presence:offline',

  // Social Universe
  POST_CREATE = 'post:create',
  POST_UPDATE = 'post:update',
  POST_DELETE = 'post:delete',
  POST_REACTION = 'post:reaction',
  POST_COMMENT = 'post:comment',
  FEED_UPDATE = 'feed:update',

  // Commerce Universe
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_STOCK = 'product:stock',
  ORDER_STATUS = 'order:status',
  CART_UPDATE = 'cart:update',

  // Learning Universe
  LESSON_PROGRESS = 'lesson:progress',
  COURSE_ANNOUNCEMENT = 'course:announcement',
  QUIZ_RESULT = 'quiz:result',

  // Communities Universe
  MESSAGE = 'message:new',
  MESSAGE_EDITED = 'message:edited',
  MESSAGE_DELETED = 'message:deleted',
  MEMBER_JOINED = 'member:joined',
  MEMBER_LEFT = 'member:left',
  TYPING_INDICATOR = 'typing:indicator',

  // Entertainment Universe
  PLAYLIST_UPDATE = 'playlist:update',
  PLAYLIST_ITEM_ADDED = 'playlist:item:added',
  NOW_PLAYING = 'now:playing',

  // Global Events
  BROADCAST = 'broadcast',
  SYNC_REQUEST = 'sync:request',
  SYNC_RESPONSE = 'sync:response',
}

// ============================================================================
// WEBSOCKET MESSAGE STRUCTURES
// ============================================================================

export interface WSMessage {
  type: WSEventType;
  payload: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface WSConnectionContext {
  userId: string;
  sessionId: string;
  email: string;
  universe?: string; // Which universe(s) the user is subscribed to
  rooms?: string[]; // List of chat rooms / channels
  socketId: string;
  connectedAt: number;
}

// ============================================================================
// EVENT PAYLOADS
// ============================================================================

export interface AuthPayload {
  sessionId: string;
  userId: string;
  token: string;
}

export interface NotificationPayload {
  id: string;
  type: 'mention' | 'reaction' | 'comment' | 'system' | 'message';
  title: string;
  message: string;
  link?: string;
  read: boolean;
}

export interface PostCreatePayload {
  id: string;
  userId: string;
  content: string;
  universe: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PostReactionPayload {
  postId: string;
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
}

export interface MessagePayload {
  id: string;
  communityId: string;
  userId: string;
  content: string;
  createdAt: string;
  edited?: boolean;
}

export interface TypingIndicatorPayload {
  communityId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'idle';
  lastSeen?: string;
  universe?: string;
}

export interface SyncRequestPayload {
  entityType: 'posts' | 'messages' | 'notifications';
  entityId?: string;
  lastSyncTime: number;
}

export interface SyncResponsePayload {
  entityType: string;
  data: any[];
  syncTime: number;
}

// ============================================================================
// WEBSOCKET ERRORS
// ============================================================================

export interface WSErrorPayload {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export enum WSErrorCode {
  AUTHENTICATION_FAILED = 'AUTH_FAILED',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
}

// ============================================================================
// ROOM/CHANNEL NAMING
// ============================================================================

export const WSRooms = {
  user: (userId: string) => `user:${userId}`,
  community: (communityId: string) => `community:${communityId}`,
  universe: (universe: string) => `universe:${universe}`,
  notifications: (userId: string) => `notifications:${userId}`,
  presence: 'presence:all',
  broadcast: 'broadcast:all',
};
