'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { AuroraDataService } from '@/data/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

const watchlist = AuroraDataService.getWatchlist();
const readingList = AuroraDataService.getReadingList();
const shoppingList = AuroraDataService.getShoppingList();

export function HomeLists() {
  const router = useRouter();
  const entertainmentIcon = resolvePageIconName('Entertainment', '/entertainment');
  const learningIcon = resolvePageIconName('Learning', '/learning');
  const commerceIcon = resolvePageIconName('Commerce', '/commerce');
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
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <span className={getPageIconColor(entertainmentIcon)}><PageIcon pageName={entertainmentIcon} className="w-4 h-4" /></span>
              Watchlist
            </span>
          </CardTitle>
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
            <Link key={item.id} href="/entertainment" className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5"><span className={getPageIconColor(entertainmentIcon)}><PageIcon pageName={entertainmentIcon} className="w-3.5 h-3.5" /></span>{item.title}</p>
                <Badge size="sm" variant="info">{item.provider}</Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                {item.type.toUpperCase()} {item.progressPercent ? `• ${item.progressPercent}%` : ''}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <span className={getPageIconColor(learningIcon)}><PageIcon pageName={learningIcon} className="w-4 h-4" /></span>
              Reading List
            </span>
          </CardTitle>
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
            <Link key={item.id} href="/learning" className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5"><span className={getPageIconColor(learningIcon)}><PageIcon pageName={learningIcon} className="w-3.5 h-3.5" /></span>{item.title}</p>
                <Badge size="sm" variant="default">{item.source}</Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                {item.author} {item.progressPercent ? `• ${item.progressPercent}%` : ''}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <span className={getPageIconColor(commerceIcon)}><PageIcon pageName={commerceIcon} className="w-4 h-4" /></span>
              Shopping List
            </span>
          </CardTitle>
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
            <Link key={item.id} href="/commerce" className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5"><span className={getPageIconColor(commerceIcon)}><PageIcon pageName={commerceIcon} className="w-3.5 h-3.5" /></span>{item.title}</p>
                <Badge
                  size="sm"
                  variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}
                >
                  {item.priority}
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                {item.providerId.toUpperCase()} • ${(item.priceCents / 100).toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </section>
  );
}
