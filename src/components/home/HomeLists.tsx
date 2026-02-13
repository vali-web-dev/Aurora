'use client';

import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { AuroraDataService } from '@/data/types';

const watchlist = AuroraDataService.getWatchlist();
const readingList = AuroraDataService.getReadingList();
const shoppingList = AuroraDataService.getShoppingList();

export function HomeLists() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Watchlist</h3>
          <Button variant="ghost" size="sm">Open</Button>
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Reading List</h3>
          <Button variant="ghost" size="sm">Open</Button>
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Shopping List</h3>
          <Button variant="ghost" size="sm">Open</Button>
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
