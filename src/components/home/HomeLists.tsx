'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { AuroraDataService } from '@/data/types';
import { useRouter } from 'next/navigation';

const watchlist = AuroraDataService.getWatchlist();
const readingList = AuroraDataService.getReadingList();
const shoppingList = AuroraDataService.getShoppingList();

export function HomeLists() {
  const router = useRouter();
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

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
          <CardTitle>Watchlist</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('/entertainment', 'Watchlist')}
          >
            Open
          </Button>
        </div>
        <div className="space-y-3">
          {watchlist.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
                <Badge size="sm" variant="info">{item.provider}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {item.type.toUpperCase()} {item.progressPercent ? `• ${item.progressPercent}%` : ''}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Reading List</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('/learning', 'Reading List')}
          >
            Open
          </Button>
        </div>
        <div className="space-y-3">
          {readingList.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
                <Badge size="sm" variant="default">{item.source}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {item.author} {item.progressPercent ? `• ${item.progressPercent}%` : ''}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Shopping List</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('/commerce', 'Commerce')}
          >
            Open
          </Button>
        </div>
        <div className="space-y-3">
          {shoppingList.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
                <Badge
                  size="sm"
                  variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}
                >
                  {item.priority}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {item.providerId.toUpperCase()} • ${(item.priceCents / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
