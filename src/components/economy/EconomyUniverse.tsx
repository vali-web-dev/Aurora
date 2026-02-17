'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { formatDate } from '@/lib/utils';

const listings = AuroraDataService.getMarketplaceListings();
const payouts = AuroraDataService.getCreatorPayouts();

const payoutTotal = payouts.reduce((sum, payout) => sum + payout.amountCents, 0);
const averagePrice = listings.length
  ? listings.reduce((sum, listing) => sum + listing.priceCents, 0) / listings.length
  : 0;

const categoryTotals = listings.reduce<Record<string, number>>((acc, listing) => {
  acc[listing.category] = (acc[listing.category] ?? 0) + 1;
  return acc;
}, {});

const categoryBreakdown = Object.entries(categoryTotals)
  .map(([category, count]) => ({ category, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 4);

const revenueTrend = [18, 24, 21, 28, 33, 41];
const payoutStatusCounts = payouts.reduce<Record<string, number>>((acc, payout) => {
  acc[payout.status] = (acc[payout.status] ?? 0) + 1;
  return acc;
}, {});

const latestActivity = [
  {
    id: 'activity-1',
    title: `${listings[0]?.title ?? 'New listing'} went live`,
    detail: `Creator: ${listings[0]?.creator ?? 'Aurora Studio'}`,
  },
  {
    id: 'activity-2',
    title: `Payout ${payouts[0]?.status ?? 'processing'}`,
    detail: `${payouts[0]?.creator ?? 'Aurora Studio'} • $${((payouts[0]?.amountCents ?? 0) / 100).toFixed(2)}`,
  },
  {
    id: 'activity-3',
    title: `Top category: ${categoryBreakdown[0]?.category ?? 'templates'}`,
    detail: `${categoryBreakdown[0]?.count ?? 0} listings in demand`,
  },
];

export function EconomyUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Economy Universe"
        description="Creator marketplaces, digital goods, and ethical monetization inside Aurora."
      />

      <SurfaceSection title="Marketplace Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Marketplace Listings" value={listings.length} helper="Active" />
          <StatCard label="Creator Payouts" value={payouts.length} helper="All time" />
          <StatCard label="Total Distributed" value={`$${(payoutTotal / 100).toFixed(0)}`} helper="YTD" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Marketplace Momentum" description="Revenue and category signals.">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-slate-500 dark:text-slate-400">
                Revenue Snapshot
              </p>
              <CardTitle>Marketplace Momentum</CardTitle>
            </div>
            <Badge size="sm" variant="info">+12% WoW</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list" aria-label="Marketplace metrics">
            <div className="space-y-2">
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">Avg Listing Price</p>
              <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">
                ${Math.round(averagePrice / 100)}
              </p>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Across {listings.length} listings</p>
            </div>
            <div className="space-y-2">
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">Category Mix</p>
              <div className="space-y-2" role="list" aria-label="Category mix">
                {categoryBreakdown.map((entry) => (
                  <div key={entry.category} role="listitem" className="aurora-label flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="aurora-label aurora-text-xs">{entry.category}</span>
                    <span>{entry.count} items</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">Revenue Trend</p>
              <div className="flex items-end gap-2 h-20" role="list" aria-label="Revenue trend">
                {revenueTrend.map((value, index) => (
                  <div key={`rev-${value}-${index}`} role="listitem" className="flex-1">
                    <div
                      className="w-full rounded-md bg-emerald-500/80"
                      style={{ height: `${value}%` }}
                      title={`Week ${index + 1}: ${value}%`}
                    />
                  </div>
                ))}
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Last 6 weeks distribution</p>
            </div>
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Marketplace & Payouts">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Marketplace</CardTitle>
              <Button variant="secondary" size="sm">Browse</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Marketplace listings">
              {listings.map((listing) => (
                <div key={listing.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{listing.title}</p>
                    <Badge size="sm" variant="info">{listing.category}</Badge>
                  </div>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">By {listing.creator}</p>
                  <div className="aurora-label flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>${(listing.priceCents / 100).toFixed(2)}</span>
                    <span>★ {listing.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Payouts</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Payout status counts">
                <Badge size="sm" variant="success" role="listitem">
                  Paid {payoutStatusCounts.paid ?? 0}
                </Badge>
                <Badge size="sm" variant="warning" role="listitem">
                  Processing {payoutStatusCounts.processing ?? 0}
                </Badge>
                <Badge size="sm" variant="default" role="listitem">
                  Pending {payoutStatusCounts.pending ?? 0}
                </Badge>
              </div>
              <div className="space-y-3" role="list" aria-label="Recent payouts">
                {payouts.map((payout) => (
                  <div key={payout.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="aurora-label text-slate-900 dark:text-slate-50">{payout.creator}</p>
                      <Badge size="sm" variant={payout.status === 'paid' ? 'success' : payout.status === 'processing' ? 'warning' : 'default'}>
                        {payout.status}
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      ${(payout.amountCents / 100).toFixed(2)} • {formatDate(payout.scheduledFor)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Revenue Intelligence</CardTitle>
              <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                Automated insights surface ethical growth opportunities.
              </p>
              <Button variant="primary" size="sm">Open Insights</Button>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Latest Activity</CardTitle>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="space-y-3">
                {latestActivity.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{item.title}</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
