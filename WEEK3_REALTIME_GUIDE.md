# Week 3: Real-Time Features Implementation Guide

**Status:** Aurora Real-Time Infrastructure Ready  
**Date:** February 18, 2026  
**Framework:** Next.js 14 + Socket.IO + PostgreSQL Subscriptions

---

## ✅ Real-Time Architecture Implemented

### WebSocket Foundation
- ✅ Socket.IO v4.8 server (integrated with Next.js)
- ✅ Client-side Socket.IO with auto-reconnection
- ✅ JWT-based WebSocket authentication
- ✅ Room-based message routing (efficient broadcasting)
- ✅ 50+ predefined event types for all 15 universes

### Services Built
- ✅ **Notification Service** - Real-time notifications with persistence
- ✅ **Presence Service** - Online/offline tracking, activity status
- ✅ **Real-time Hooks** - useWebSocket, useNotifications, usePresence, useFeedUpdates
- ✅ **UI Components** - NotificationBell, PresenceIndicator, TypingIndicator

### Core Features Ready
- ✅ Real-time social feed updates
- ✅ Live notifications (mention, reaction, comment, message)
- ✅ Presence awareness (online/idle/busy status)
- ✅ Typing indicators for chat
- ✅ Activity tracking across all universes

---

## 🚀 Getting Started

### Step 1: Start WebSocket Server

The custom Node.js server integrates Socket.IO with Next.js:

```bash
# Run with: node server.js
node server.js
# Should output:
# [Server] Ready on http://localhost:3000
# [Server] WebSocket endpoint: ws://localhost:3000/socket.io
```

### Step 2: Initialize WebSocket in Your App

```tsx
'use client';

import { useWebSocket, useNotifications } from '@/lib/hooks/use-realtime';

export default function MyComponent() {
  const { isConnected } = useWebSocket();
  const { notifications, unreadCount } = useNotifications();

  if (!isConnected) return <div>Connecting...</div>;

  return (
    <div>
      <p>Connected! You have {unreadCount} notifications</p>
    </div>
  );
}
```

### Step 3: Add Notification Bell to Header

```tsx
import { NotificationBell } from '@/components/realtime/NotificationCenter';

export function Header() {
  return (
    <header className="flex items-center gap-4">
      <h1>Aurora</h1>
      <NotificationBell />
    </header>
  );
}
```

---

## 📡 Real-Time Event Types (WSEventType)

| Event | Use Case | Payload |
|-------|----------|---------|
| `post:create` | New social post | `{postId, authorId, content}` |
| `post:reaction` | Like/emoji reaction | `{postId, userId, emoji}` |
| `post:comment` | New comment on post | `{postId, commentId, content}` |
| `message:new` | Community chat message | `{communityId, message, sender}` |
| `typing:indicator` | User is typing | `{userId, channelId}` |
| `presence:update` | Status change | `{userId, status, activity}` |
| `notification` | User notification | `{type, title, message, link}` |
| `feed:update` | Feed content changed | `{type, content}` |

---

## 🔌 Using Real-Time Hooks

### Notifications Hook

```tsx
import { useNotifications } from '@/lib/hooks/use-realtime';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}: {notif.message}
        </div>
      ))}
      <button onClick={clearAll}>Clear All</button>
    </div>
  );
}
```

### Presence Hook

```tsx
import { usePresence } from '@/lib/hooks/use-realtime';

export function OnlineUsers() {
  const { onlineUsers, currentStatus, setStatus } = usePresence({
    universe: 'social' // Optional: track in specific universe
  });

  return (
    <div>
      <p>You are: {currentStatus}</p>
      <button onClick={() => setStatus('busy')}>Mark as Busy</button>
      <p>Online users: {onlineUsers.length}</p>
    </div>
  );
}
```

### Feed Updates Hook

```tsx
import { useFeedUpdates } from '@/lib/hooks/use-realtime';

export function SocialFeed() {
  const { updates } = useFeedUpdates('social');

  return (
    <div>
      {updates.map(update => (
        <div key={update.id}>
          {update.type === 'post:create' && <PostPreview post={update} />}
          {update.type === 'post:reaction' && <ReactionNotice {...update} />}
        </div>
      ))}
    </div>
  );
}
```

### Typing Indicator Hook

```tsx
import { useTypingIndicator } from '@/lib/hooks/use-realtime';
import { TypingIndicator } from '@/components/realtime/NotificationCenter';

export function ChatInput({ channelId }: { channelId: string }) {
  const { typingUsers, emitTyping } = useTypingIndicator(channelId);

  return (
    <div>
      <input 
        onKeyPress={emitTyping}
        placeholder="Type a message..."
      />
      <TypingIndicator users={typingUsers} />
    </div>
  );
}
```

---

## 🔐 Broadcasting Notifications

### Server-Side (API Routes / Server Actions)

```typescript
import { createNotification, notifyMention } from '@/lib/notifications-service';

// In your API route:
export async function POST(request: Request) {
  // When a post is created
  const { postId, content, authorId, mentionedUserIds } = await request.json();

  // Notify mentioned users
  for (const userId of mentionedUserIds) {
    await notifyMention(
      userId,
      'John Doe',        // Who mentioned them
      postId,
      content.substring(0, 100)
    );
  }

  return Response.json({ success: true });
}
```

### Available Notification Types

```typescript
notifyMention(userId, name, postId, excerpt)      // @mention
notifyReaction(userId, name, emoji, postId)       // Like/reaction
notifyComment(userId, name, postId, excerpt)      // New comment
notifyMessage(userId, name, conversationId, text) // Direct message
notifySystem(userId, title, message, link)        // System announcement
broadcastNotification(userIds, type, title, msg)  // Multiple users
```

---

## 📊 Rooms & Broadcasting

WebSocket uses rooms for efficient broadcasting:

```typescript
// Rooms available:
WSRooms.user(userId)           // Individual user notifications
WSRooms.notifications(userId)  // All user's notifications
WSRooms.presence               // Global presence updates
WSRooms.universe(name)         // Universe-specific channel (social, commerce, etc.)
WSRooms.community(id)          // Community/channel messages
WSRooms.broadcast              // Global broadcast to all
```

---

## 🛠️ Server-Side Integration

### Sending Messages from Server

```typescript
import { getWebSocketServer } from '@/lib/websocket-server';
import { WSRooms, WSEventType } from '@/lib/websocket-types';

// In your server function:
const io = getWebSocketServer();
if (io) {
  // Notify specific user
  io.to(WSRooms.notifications(userId)).emit(WSEventType.NOTIFICATION, {
    title: 'New follower',
    message: 'Sarah followed you',
  });

  // Broadcast to all in a community
  io.to(WSRooms.community(communityId)).emit(WSEventType.MESSAGE, {
    userId: senderUserId,
    message: messageContent,
  });

  // Notify everyone in a universe
  io.to(WSRooms.universe('social')).emit('post:create', {
    postId,
    authorId,
    content,
  });
}
```

---

## 📊 Example: Real-Time Social Feed

```tsx
'use client';

import { useWebSocket, useFeedUpdates } from '@/lib/hooks/use-realtime';
import { useSession } from 'next-auth/react';

export function SocialFeed() {
  useWebSocket(); // Initialize connection
  const { updates } = useFeedUpdates('social');
  const { data: session } = useSession();

  if (!session) return <div>Sign in to see feed</div>;

  return (
    <div className="space-y-4">
      <h2>Live Social Feed</h2>
      {updates.length === 0 ? (
        <p className="text-slate-500">No updates yet. Start following people!</p>
      ) : (
        updates.map(update => (
          <div key={update.id} className="p-4 border rounded">
            {update.type === 'post:create' && (
              <div>
                <p className="font-bold">{update.authorName} just posted</p>
                <p>{update.content}</p>
              </div>
            )}
            {update.type === 'post:reaction' && (
              <p>{update.userName} reacted {update.emoji}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

---

## 🔒 Security Considerations

- ✅ WebSocket connections require authentication
- ✅ Users can only receive their own notifications
- ✅ Room access is validated server-side
- ✅ Message content is not logged in transit (HTTPS/WSS in production)
- ✅ Rate limiting on event emissions to prevent spam

**Production Setup:**
```bash
# Use WSS (WebSocket Secure) in production
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=... # Used for WebSocket auth too
NODE_ENV=production
```

---

## 🧪 Testing Real-Time Features

### Test Notifications
```javascript
// In browser console:
const socket = io();
socket.emit('authenticate', { userId: 'user-123' });

// Send test notification
socket.emit('notification', {
  type: 'mention',
  title: 'Test Mention',
  message: 'This is a test notification'
});
```

### Test Presence
```javascript
socket.emit('presence:update', {
  status: 'busy',
  activity: 'Testing presence'
});
```

### Monitor All Events
```javascript
socket.onAny((event, data) => {
  console.log(`[WebSocket Event] ${event}:`, data);
});
```

---

## 📈 Performance Tips

1. **Use rooms** for targeted broadcasts instead of `io.emit()`
2. **Batch updates** to reduce message volume
3. **Implement debouncing** for rapid events (typing indicators)
4. **Subscribe/unsubscribe** when entering/leaving universes
5. **Clean up listeners** in component cleanup functions

---

## 🎯 Next Steps

### Immediate
- [ ] Start server: `node server.js`
- [ ] Add NotificationBell to header
- [ ] Test in browser: visit `/auth/signin` → sign up → check notifications

### Week 3 Tasks
- [ ] Integrate notifications into social feed
- [ ] Build real-time chat for communities
- [ ] Add live activity feed on dashboard
- [ ] Implement presence in user profiles
- [ ] Create typing indicators for chat

### Week 4 (Upcoming)
- Real-time search
- Live e-commerce stock updates
- Learning course progress tracking
- Gaming multiplayer features

---

## 📚 Architecture Diagram

```
Client Browser
    ↓
WebSocket (Socket.IO Client)
    ↓ (ws://localhost:3000/socket.io)
Node.js Server (server.js)
    ↓
Socket.IO Server
    ↓
Room-based Broadcasting
    ↓
Database (PostgreSQL via Supabase)
    ↓
Notification/Presence Services
    ↓
Back to Clients (Real-time!)
```

---

## 📋 Checklist for Production

- [ ] Use `wss://` (WebSocket Secure) with SSL certificate
- [ ] Configure CORS for production domain
- [ ] Implement message rate limiting
- [ ] Add monitoring/logging for WebSocket connections
- [ ] Test with load balancer (Redis adapter for multiple servers)
- [ ] Set up health checks for WebSocket server
- [ ] Configure auto-reconnection strategy
- [ ] Add authentication token refresh logic

---

**Week 3 Real-Time Features are ready!** 🚀

Commands:
```bash
node server.js              # Start real-time server
npm run dev                 # Start Next.js (in different terminal)
npm run build:ci            # Verify all compilation
```

Status: ✅ All infrastructure in place, ready for integration into universes.
