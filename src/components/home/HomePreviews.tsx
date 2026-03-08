import Link from 'next/link';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/aurora/Badge';
import { AuroraDataService } from '@/data/types';
import { formatNumber } from '@/lib/utils';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

const products = AuroraDataService.getProducts().slice(0, 3);
const mediaItems = AuroraDataService.getMediaItems().slice(0, 3);
const listings = AuroraDataService.getMarketplaceListings().slice(0, 3);
const plugins = AuroraDataService.getPlugins().slice(0, 3);

export function HomePreviews() {
  const commerceIcon = resolvePageIconName('Commerce', '/commerce');
  const entertainmentIcon = resolvePageIconName('Entertainment', '/entertainment');
  const economyIcon = resolvePageIconName('Economy', '/economy');
  const developerIcon = resolvePageIconName('Developer', '/developer');

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commerce preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className={getPageIconColor(commerceIcon)}><PageIcon pageName={commerceIcon} className="w-3.5 h-3.5" /></span>
                  Commerce
                </span>
              </p>
              <CardTitle>Curated for you</CardTitle>
            </div>
            <Link href="/product">
              <Button variant="secondary" size="sm">Shop</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href="/commerce"
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5">
                    <span className={getPageIconColor(commerceIcon)}><PageIcon pageName={commerceIcon} className="w-3.5 h-3.5" /></span>
                    {product.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {product.providerId.toUpperCase()} • ${(product.priceCents / 100).toFixed(2)}
                  </p>
                </div>
                <Badge size="sm" variant="info">★ {product.rating.toFixed(1)}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        {/* Entertainment preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className={getPageIconColor(entertainmentIcon)}><PageIcon pageName={entertainmentIcon} className="w-3.5 h-3.5" /></span>
                  Entertainment
                </span>
              </p>
              <CardTitle>Trending now</CardTitle>
            </div>
            <Link href="/entertainment">
              <Button variant="secondary" size="sm">Explore</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {mediaItems.map((item) => (
              <Link
                key={item.id}
                href="/entertainment"
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5">
                    <span className={getPageIconColor(entertainmentIcon)}><PageIcon pageName={entertainmentIcon} className="w-3.5 h-3.5" /></span>
                    {item.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {item.provider} • {item.durationMinutes} min
                  </p>
                </div>
                <Badge size="sm" variant={item.type === 'live' ? 'error' : 'primary'}>
                  {item.type.toUpperCase()}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Economy preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className={getPageIconColor(economyIcon)}><PageIcon pageName={economyIcon} className="w-3.5 h-3.5" /></span>
                  Economy
                </span>
              </p>
              <CardTitle>Marketplace momentum</CardTitle>
            </div>
            <Link href="/economy">
              <Button variant="secondary" size="sm">Open</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href="/economy"
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5">
                    <span className={getPageIconColor(economyIcon)}><PageIcon pageName={economyIcon} className="w-3.5 h-3.5" /></span>
                    {listing.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {listing.creator} • ${(listing.priceCents / 100).toFixed(2)}
                  </p>
                </div>
                <Badge size="sm" variant="info">{listing.category}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        {/* Developer preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className={getPageIconColor(developerIcon)}><PageIcon pageName={developerIcon} className="w-3.5 h-3.5" /></span>
                  Developer
                </span>
              </p>
              <CardTitle>Build surfaces faster</CardTitle>
            </div>
            <Link href="/developer">
              <Button variant="secondary" size="sm">Open</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {plugins.map((plugin) => (
              <Link
                key={plugin.id}
                href="/developer"
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50 inline-flex items-center gap-1.5">
                    <span className={getPageIconColor(developerIcon)}><PageIcon pageName={developerIcon} className="w-3.5 h-3.5" /></span>
                    {plugin.name}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    v{plugin.version} • {formatNumber(plugin.installs)} installs
                  </p>
                </div>
                <Badge size="sm" variant={plugin.status === 'active' ? 'success' : 'warning'}>
                  {plugin.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
