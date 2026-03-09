'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

interface CompanionMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'greeting' | 'suggestion' | 'reminder' | 'insight';
}

const companionGreetings = [
  "Good to see you! Ready to explore Aurora today?",
  "Welcome back! I've noticed some interesting updates in your universes.",
  "Hello! Your digital ecosystem is thriving. Let me show you around.",
  "Hi there! I'm here to make your Aurora experience seamless.",
];

const companionSuggestions = [
  {
    text: "You have 3 unread messages in your communities. Want me to show them?",
    action: { label: "View Messages", href: "/guilds" }
  },
  {
    text: "I noticed you've been enjoying Entertainment. Check out the new releases.",
    action: { label: "Explore", href: "/entertainment" }
  },
  {
    text: "Your cart has items waiting. Complete your purchase?",
    action: { label: "Go to Cart", href: "/commerce/cart" }
  },
  {
    text: "Time to learn something new? I found courses matching your interests.",
    action: { label: "Browse Courses", href: "/learning" }
  },
];

export function CompanionWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<CompanionMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initial greeting
    const greeting = companionGreetings[Math.floor(Math.random() * companionGreetings.length)];
    setCurrentMessage({
      id: '1',
      text: greeting,
      timestamp: new Date(),
      type: 'greeting',
    });

    // Periodically show suggestions
    const interval = setInterval(() => {
      if (!isExpanded) {
        const suggestion = companionSuggestions[Math.floor(Math.random() * companionSuggestions.length)];
        setIsTyping(true);
        setTimeout(() => {
          setCurrentMessage({
            id: Math.random().toString(),
            text: suggestion.text,
            timestamp: new Date(),
            type: 'suggestion',
          });
          setIsTyping(false);
        }, 1000);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isExpanded]);

  const suggestion = companionSuggestions.find(s => s.text === currentMessage?.text);

  return (
    <Card
      className={clsx(
        'relative overflow-hidden transition-all duration-500',
        isExpanded ? 'p-6' : 'p-4'
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
      
      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <div>
              <h3 className="aurora-label text-slate-900 dark:text-slate-50">
                Aurora Companion
              </h3>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Your AI assistant
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>

        {/* Message */}
        {currentMessage && (
          <div
            className={clsx(
              'p-4 rounded-lg',
              'bg-slate-50 dark:bg-slate-900',
              'border border-slate-200 dark:border-slate-800',
              'transition-all duration-300'
            )}
          >
            {isTyping ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce transform-gpu" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce transform-gpu" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce transform-gpu" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                  Companion is thinking...
                </span>
              </div>
            ) : (
              <>
                <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentMessage.text}
                </p>
                {suggestion && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = suggestion.action.href}
                    >
                      {suggestion.action.label} →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="aurora-label text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert('Voice interaction coming soon!')}
                className={clsx(
                  'p-3 rounded-lg text-left',
                  'bg-slate-100 dark:bg-slate-800',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-colors'
                )}
              >
                <div className="text-lg mb-1">🎤</div>
                <div className="aurora-label text-xs text-slate-900 dark:text-slate-50">
                  Voice Chat
                </div>
              </button>
              
              <button
                onClick={() => alert('Schedule assistant coming soon!')}
                className={clsx(
                  'p-3 rounded-lg text-left',
                  'bg-slate-100 dark:bg-slate-800',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-colors'
                )}
              >
                <div className="text-lg mb-1">📅</div>
                <div className="aurora-label text-xs text-slate-900 dark:text-slate-50">
                  My Schedule
                </div>
              </button>
              
              <button
                onClick={() => alert('Recommendations coming soon!')}
                className={clsx(
                  'p-3 rounded-lg text-left',
                  'bg-slate-100 dark:bg-slate-800',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-colors'
                )}
              >
                <div className="text-lg mb-1">✨</div>
                <div className="aurora-label text-xs text-slate-900 dark:text-slate-50">
                  Suggestions
                </div>
              </button>
              
              <button
                onClick={() => alert('Analytics coming soon!')}
                className={clsx(
                  'p-3 rounded-lg text-left',
                  'bg-slate-100 dark:bg-slate-800',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-colors'
                )}
              >
                <div className="text-lg mb-1">📊</div>
                <div className="aurora-label text-xs text-slate-900 dark:text-slate-50">
                  Insights
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Sunny',
    icon: '☀️',
    location: 'Your Location',
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-1">
            {weather.location}
          </div>
          <div className="aurora-label text-3xl font-bold text-slate-900 dark:text-slate-50">
            {weather.temp}°F
          </div>
          <div className="aurora-label text-sm text-slate-600 dark:text-slate-400 mt-1">
            {weather.condition}
          </div>
        </div>
        <div className="text-6xl">
          {weather.icon}
        </div>
      </div>
    </Card>
  );
}

export function NotificationsWidget() {
  const [notifications] = useState([
    { id: '1', text: 'New message from John', icon: '💬', time: '5m ago' },
    { id: '2', text: 'Order shipped', icon: '📦', time: '1h ago' },
    { id: '3', text: 'Community invite', icon: '👥', time: '2h ago' },
  ]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="aurora-label text-slate-900 dark:text-slate-50">
          Notifications
        </h3>
        <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">
          {notifications.length} new
        </span>
      </div>
      
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-lg',
              'bg-slate-50 dark:bg-slate-900',
              'hover:bg-slate-100 dark:hover:bg-slate-900',
              'transition-colors cursor-pointer'
            )}
          >
            <span className="text-2xl">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="aurora-label text-sm text-slate-900 dark:text-slate-50 truncate">
                {notif.text}
              </div>
              <div className="aurora-label text-xs text-slate-500 dark:text-slate-500">
                {notif.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
