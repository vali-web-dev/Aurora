'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { useCartStore } from '@/lib/commerce/cart-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import clsx from 'clsx';

interface UniverseCardProps {
  name: string;
  href: string;
  icon: string;
  color: string;
  description: string;
  badge?: string;
}

export function UniverseCard({ name, href, icon, color, description, badge }: UniverseCardProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'group relative p-6 rounded-xl',
        'bg-gradient-to-br from-white to-slate-50',
        'dark:from-slate-900 dark:to-slate-800/50',
        'border border-slate-200 dark:border-slate-700',
        'hover:border-slate-300 dark:hover:border-slate-600',
        'hover:shadow-lg dark:hover:shadow-slate-900/50',
        'transition-all duration-300',
        'overflow-hidden'
      )}
    >
      {/* Accent gradient */}
      <div
        className={clsx(
          'absolute inset-0 opacity-0 group-hover:opacity-10',
          'bg-gradient-to-br transition-opacity duration-300',
          color
        )}
      />
      
      {/* Content */}
      <div className="relative space-y-3">
        <div className="flex items-start justify-between">
          <div className={clsx('text-4xl', color.replace('from-', 'text-').split(' ')[0])}>
            {icon}
          </div>
          {badge && (
            <Badge variant="info" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 mb-1">
            {name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {description}
          </p>
        </div>
        
        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
          Explore →
        </div>
      </div>
    </Link>
  );
}

export function RecentOrdersWidget() {
  const { orders } = useOrderStore();
  const recentOrders = orders.slice(0, 3);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Recent Orders
        </h3>
        <Link
          href="/commerce/orders"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all
        </Link>
      </div>
      
      {recentOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-400 dark:text-slate-600 mb-3">🛍️</div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No orders yet
          </p>
          <Link href="/commerce">
            <Button variant="secondary" size="sm">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/commerce/orders/${order.id}`}
              className={clsx(
                'block p-4 rounded-lg',
                'bg-slate-50 dark:bg-slate-900/50',
                'hover:bg-slate-100 dark:hover:bg-slate-900',
                'border border-slate-200 dark:border-slate-800',
                'transition-colors'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Order #{order.id.slice(0, 8)}
                </span>
                <Badge
                  variant={
                    order.status === 'delivered'
                      ? 'success'
                      : order.status === 'shipped'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {order.cartItems.length} item{order.cartItems.length !== 1 ? 's' : ''}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  ${(order.totalCents / 100).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

export function CartSummaryWidget() {
  const { items, total } = useCartStore();
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Shopping Cart
        </h3>
        {items.length > 0 && (
          <Badge variant="info">{items.length}</Badge>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-400 dark:text-slate-600 mb-3">🛒</div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Your cart is empty
          </p>
          <Link href="/commerce">
            <Button variant="secondary" size="sm">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Items</span>
              <span className="font-medium text-slate-900 dark:text-slate-50">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/commerce/cart" className="flex-1">
              <Button variant="auroraSecondary" size="sm" className="w-full">
                View Cart
              </Button>
            </Link>
            <Link href="/commerce/checkout" className="flex-1">
              <Button variant="aurora" size="sm" className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ActivityFeedWidget({ activities }: { activities: any[] }) {
  const [filter, setFilter] = useState<'all' | 'post' | 'community_join' | 'message'>('all');
  
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Recent Activity
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className={clsx(
            'px-3 py-1 rounded-lg text-sm',
            'bg-slate-100 dark:bg-slate-800',
            'border border-slate-200 dark:border-slate-700',
            'text-slate-900 dark:text-slate-50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          <option value="all">All</option>
          <option value="post">Posts</option>
          <option value="community_join">Communities</option>
          <option value="message">Messages</option>
        </select>
      </div>
      
      {filteredActivities.length === 0 ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          No activity found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const colors = {
              post: 'bg-blue-500',
              community_join: 'bg-purple-500',
              message: 'bg-green-500',
            };
            const icons = {
              post: '📝',
              community_join: '👥',
              message: '💬',
            };
            const color = colors[activity.type as keyof typeof colors] || 'bg-slate-500';
            const icon = icons[activity.type as keyof typeof icons] || '•';
            
            return (
              <div
                key={activity.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'bg-slate-50 dark:bg-slate-900/50',
                  'hover:bg-slate-100 dark:hover:bg-slate-900',
                  'transition-colors cursor-pointer'
                )}
              >
                <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-xl', color)}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {activity.title}
                  </div>
                  {activity.description && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {activity.description}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function QuickStatsWidget({ stats }: { stats: any }) {
  const statCards = [
    {
      label: 'Posts',
      value: stats.posts,
      icon: '📝',
      color: 'from-blue-500 to-cyan-500',
      href: '/social',
    },
    {
      label: 'Communities',
      value: stats.communities,
      icon: '👥',
      color: 'from-purple-500 to-pink-500',
      href: '/guilds',
    },
    {
      label: 'Messages',
      value: stats.messages,
      icon: '💬',
      color: 'from-green-500 to-emerald-500',
      href: '/guilds',
    },
    {
      label: 'Connections',
      value: stats.connections,
      icon: '🤝',
      color: 'from-orange-500 to-red-500',
      href: '/social',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className={clsx(
            'group relative p-6 rounded-xl overflow-hidden',
            'bg-white dark:bg-slate-900',
            'border border-slate-200 dark:border-slate-800',
            'hover:border-slate-300 dark:hover:border-slate-700',
            'hover:shadow-lg dark:hover:shadow-slate-900/50',
            'transition-all duration-300'
          )}
        >
          <div className={clsx(
            'absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10',
            'transition-opacity duration-300',
            stat.color
          )} />
          
          <div className="relative space-y-2">
            <div className="text-3xl">{stat.icon}</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
