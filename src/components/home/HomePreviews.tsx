import Link from 'next/link';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/aurora/Badge';
import { AuroraDataService } from '@/data/types';
import { formatNumber } from '@/lib/utils';

const products = AuroraDataService.getProducts().slice(0, 3);
const mediaItems = AuroraDataService.getMediaItems().slice(0, 3);
const listings = AuroraDataService.getMarketplaceListings().slice(0, 3);
const plugins = AuroraDataService.getPlugins().slice(0, 3);

export function HomePreviews() {
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commerce preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                Commerce
              </p>
              <CardTitle>Curated for you</CardTitle>
            </div>
            <Link href="/product">
              <Button variant="secondary" size="sm">Shop</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50">
                    {product.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {product.providerId.toUpperCase()} • ${(product.priceCents / 100).toFixed(2)}
                  </p>
                </div>
                <Badge size="sm" variant="info">★ {product.rating.toFixed(1)}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Entertainment preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                Entertainment
              </p>
              <CardTitle>Trending now</CardTitle>
            </div>
            <Link href="/entertainment">
              <Button variant="secondary" size="sm">Explore</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50">
                    {item.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {item.provider} • {item.durationMinutes} min
                  </p>
                </div>
                <Badge size="sm" variant={item.type === 'live' ? 'error' : 'primary'}>
                  {item.type.toUpperCase()}
                </Badge>
              </div>
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
                Economy
              </p>
              <CardTitle>Marketplace momentum</CardTitle>
            </div>
            <Link href="/economy">
              <Button variant="secondary" size="sm">Open</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50">
                    {listing.title}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {listing.creator} • ${(listing.priceCents / 100).toFixed(2)}
                  </p>
                </div>
                <Badge size="sm" variant="info">{listing.category}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Developer preview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                Developer
              </p>
              <CardTitle>Build surfaces faster</CardTitle>
            </div>
            <Link href="/developer">
              <Button variant="secondary" size="sm">Open</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div>
                  <p className="aurora-label text-slate-900 dark:text-slate-50">
                    {plugin.name}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    v{plugin.version} • {formatNumber(plugin.installs)} installs
                  </p>
                </div>
                <Badge size="sm" variant={plugin.status === 'active' ? 'success' : 'warning'}>
                  {plugin.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
