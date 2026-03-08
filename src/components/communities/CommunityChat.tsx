'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { initializeSocket, disconnectSocket, onEvent, joinRoom, leaveRoom, emitEvent, authenticateSocket } from '@/lib/websocket-client';
import { WSEventType } from '@/lib/websocket-types';
import { TypingIndicator, PresenceIndicator } from '@/components/realtime/NotificationCenter';
import { AuroraShell } from '@/components/os/AuroraShell';

interface ChatMessage {
  id: string;
  communityId: number;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date | string;
  isEdited: boolean;
  editedAt?: Date | string;
}

interface CommunityMember {
  userId: string;
  userName: string;
  status: 'online' | 'idle' | 'busy' | 'offline';
  lastActive: number;
}

interface CommunityChatProps {
  communityId: number;
  communityName: string;
}

export function CommunityChat({ communityId, communityName }: CommunityChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/communities/${communityId}/messages?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session && communityId) {
      fetchMessages();
    }
  }, [session, communityId]);

  // Initialize WebSocket and subscribe to community
  useEffect(() => {
    if (!session || !communityId) return;

    const socket = initializeSocket();

    const authenticate = () => {
      const sessionId = `session-${session.expires ?? Date.now()}`;
      const userId = session.user?.email ?? session.user?.name ?? `user-${Date.now()}`;
      const token = `token-${session.expires ?? Date.now()}`;
      authenticateSocket(sessionId, userId, token).catch(() => {
        // best effort auth for realtime path
      });
    };

    socket.on('connect', authenticate);
    if (socket.connected) {
      authenticate();
    }

    joinRoom(`community:${communityId}`);

    // Listen for new messages
    const unsubscribeMessage = onEvent(WSEventType.MESSAGE, (data: any) => {
      if (data.communityId === communityId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    // Listen for message edits
    const unsubscribeEdit = onEvent(WSEventType.MESSAGE_EDITED, (data: any) => {
      if (data.communityId === communityId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.id
              ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
              : msg
          )
        );
      }
    });

    // Listen for message deletes
    const unsubscribeDelete = onEvent(WSEventType.MESSAGE_DELETED, (data: any) => {
      if (data.communityId === communityId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      }
    });

    // Listen for member presence updates
    const unsubscribePresence = onEvent(WSEventType.PRESENCE_UPDATE, (data: any) => {
      if (data.communityId === communityId) {
        setMembers((prev) => {
          const updated = prev.filter((m) => m.userId !== data.userId);
          if (data.status !== 'offline') {
            updated.push({
              userId: data.userId,
              userName: data.userName,
              status: data.status,
              lastActive: Date.now(),
            });
          }
          return updated;
        });
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = onEvent(WSEventType.TYPING_INDICATOR, (data: any) => {
      if (data.communityId !== communityId) return;
      if (data.userId === session?.user?.id) return; // Ignore own typing

      setTypingUsers((prev) => {
        const updated = prev.filter((name) => name !== data.userName);
        if (data.isTyping) {
          updated.push(data.userName);
        }
        return updated;
      });

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }, 3000);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeEdit();
      unsubscribeDelete();
      unsubscribePresence();
      unsubscribeTyping();
      socket.off('connect', authenticate);
      leaveRoom(`community:${communityId}`);
      disconnectSocket();
    };
  }, [session, communityId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Broadcast typing indicator (debounced)
  const broadcastTyping = useCallback(() => {
    if (!session) return;

    emitEvent(WSEventType.TYPING_INDICATOR, {
      communityId,
      userId: session.user?.id,
      userName: session.user?.name || 'User',
      isTyping: true,
      timestamp: Date.now(),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitEvent(WSEventType.TYPING_INDICATOR, {
        communityId,
        userId: session.user?.id,
        userName: session.user?.name || 'User',
        isTyping: false,
      });
    }, 2000);
  }, [session, communityId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          communityId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
        messageInputRef.current?.focus();

        // Clear typing indicator
        emitEvent(WSEventType.TYPING_INDICATOR, {
          communityId,
          userId: session?.user?.id,
          userName: session?.user?.name || 'User',
          isTyping: false,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onlineMembers = members.filter((m) => m.status !== 'offline');
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <AuroraShell>
      <Surface>
        <SurfaceHeader 
          title={communityName}
          description={`${onlineMembers.length} ${onlineMembers.length === 1 ? 'member' : 'members'} online`}
          actions={
            <div className="flex items-center gap-2">
              {onlineMembers.slice(0, 3).map((member) => (
                <div key={member.userId} className="flex items-center gap-1">
                  <PresenceIndicator userId={member.userId} size="sm" />
                  <span className="aurora-label text-xs">{member.userName}</span>
                </div>
              ))}
              {onlineMembers.length > 3 && (
                <span className="aurora-label text-xs text-slate-500">+{onlineMembers.length - 3}</span>
              )}
            </div>
          }
        />

        <SurfaceSection title="Community Chat" className="flex-1 flex flex-col gap-4 max-h-[calc(100vh-300px)] overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {isLoading ? (
              <p className="aurora-label text-sm text-slate-500 text-center py-4">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="aurora-label text-sm text-slate-500 text-center py-4">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="aurora-label h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {message.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="aurora-label text-sm font-medium text-slate-900 dark:text-slate-50">
                        {message.userName}
                      </p>
                      <p className="aurora-label text-xs text-slate-500">{formatTime(message.createdAt)}</p>
                      {message.isEdited && (
                        <p className="aurora-label text-xs text-slate-400"> (edited)</p>
                      )}
                    </div>
                    <p className="aurora-label text-sm text-slate-800 dark:text-slate-200 mt-1 break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex gap-3">
                <div className="aurora-label h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center flex-shrink-0" />
                <div className="flex-1">
                  <TypingIndicator users={typingUsers} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex gap-2">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (e.target.value.length > 0) {
                    broadcastTyping();
                  }
                }}
                placeholder="Type a message..."
                className="aurora-label flex-1 px-4 py-2 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSubmitting}
                className="self-end"
              >
                {isSubmitting ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </SurfaceSection>
      </Surface>
    </AuroraShell>
  );
}
