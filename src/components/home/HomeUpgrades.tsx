'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { AuroraDataService } from '@/data/types';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const notifications = AuroraDataService.getNotifications();
const learningTimeline = AuroraDataService.getLearningTimeline();
const shoppingList = AuroraDataService.getShoppingList();

const unreadCount = notifications.filter((item) => !item.read).length;

export function HomeUpgrades() {
  const router = useRouter();
  const totalShopping = shoppingList.reduce((sum, item) => sum + item.priceCents, 0);
  const highPriority = shoppingList.filter((item) => item.priority === 'high').length;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {item.title}
                </p>
                <Badge size="sm" variant={item.read ? 'default' : 'info'}>
                  {item.kind}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {item.body}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
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
            onClick={() => router.push('/learning')}
          >
            Open
          </Button>
        </div>
        <div className="space-y-3">
          {learningTimeline.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {item.title}
                </p>
                <Badge size="sm" variant="info">
                  {item.percent}%
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Course {item.courseId} • {item.dateLabel}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Shopping Detail</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/commerce/review')}
          >
            Review
          </Button>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {shoppingList.length} items • {highPriority} high priority
          </p>
          <div className="space-y-2">
            {shoppingList.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-900 dark:text-slate-50">{item.title}</span>
                <Badge size="sm" variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Total ${(totalShopping / 100).toFixed(2)}
          </p>
        </div>
      </Card>
    </section>
  );
}
