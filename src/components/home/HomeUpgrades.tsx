'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { AuroraDataService } from '@/data/types';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/commerce/order-store';

const notifications = AuroraDataService.getNotifications();
const learningTimeline = AuroraDataService.getLearningTimeline();
const shoppingList = AuroraDataService.getShoppingList();

const unreadCount = notifications.filter((item) => !item.read).length;

export function HomeUpgrades() {
  const router = useRouter();
  const { orders, orderCount, pendingCount } = useOrderStore();
  const recentOrders = useMemo(() => Array.isArray(orders) ? orders.slice(0, 3) : [], [orders]);
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const totalShopping = shoppingList.reduce((sum, item) => sum + item.priceCents, 0);
  const highPriority = shoppingList.filter((item) => item.priority === 'high').length;

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const pushNotice = (message: string, tone: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotice({ message, tone });
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 2200);
  };

  const handleNavigate = (path: string, label: string) => {
    pushNotice(`Opening ${label}...`, 'info');
    window.setTimeout(() => router.push(path), 200);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {notice && (
        <div className="lg:col-span-3">
          <InlineNotice message={notice.message} tone={notice.tone} />
        </div>
      )}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <Badge size="sm" variant={unreadCount > 0 ? 'warning' : 'default'}>
            {unreadCount} new
          </Badge>
        </div>
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50">
                  {item.title}
                </p>
                <Badge size="sm" variant={item.read ? 'default' : 'info'}>
                  {item.kind}
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                {item.body}
              </p>
              <p className="aurora-label text-xs text-slate-500 dark:text-slate-500">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm">View All</Button>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Learning Timeline</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('/learning', 'Learning Timeline')}
          >
            Open
          </Button>
        </div>
        <div className="space-y-3">
          {learningTimeline.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50">
                  {item.title}
                </p>
                <Badge size="sm" variant="info">
                  {item.percent}%
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Course {item.courseId} • {item.dateLabel}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge size="sm" variant="info">
                {pendingCount} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('/commerce/orders', 'Order History')}
            >
              View All
            </Button>
          </div>
        </div>
        {orderCount === 0 ? (
          <div className="space-y-3 text-center py-4">
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              No orders yet
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleNavigate('/commerce', 'Commerce Universe')}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              {orderCount} total orders • {pendingCount} pending delivery
            </p>
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const statusColors = {
                  pending: 'info',
                  processing: 'info',
                  shipped: 'warning',
                  delivered: 'default',
                  cancelled: 'error',
                } as const;
                return (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => handleNavigate(`/commerce/orders/${order.id}`, `Order ${order.id}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">
                        Order {order.id}
                      </p>
                      <Badge size="sm" variant={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      {order.cartItems.length} items • ${(order.totalCents / 100).toFixed(2)}
                    </p>
                    <p className="aurora-label text-xs text-slate-500 dark:text-slate-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
