'use client';

import Link from 'next/link';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';

// See AURORA_MANUAL.md § The 15 Universes: Brand Universe.
// See AURORA_QUICK_REFERENCE.md § 15 Universes at a Glance.
const brands = AuroraDataService.getBrands();
const assets = AuroraDataService.getBrandAssets();
const campaigns = AuroraDataService.getBrandCampaigns();

export function BrandUniverse() {
  const brand = brands[0];
  const brandAssets = assets.filter((asset) => asset.brandId === brand?.id);
  const brandCampaigns = campaigns.filter((campaign) => campaign.brandId === brand?.id);
  const activeCampaigns = brandCampaigns.filter((campaign) => campaign.status === 'active').length;

  if (!brand) {
    return (
      <Surface className="py-8">
        <SurfaceHeader title="Brand Universe" description="Define your identity, voice, and campaigns." />
        <Card>
          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
            No brand profiles yet. Create your first brand to begin.
          </p>
        </Card>
      </Surface>
    );
  }

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Brand Universe"
        description="Your brand is a living mind. Align story, tone, and campaigns in one place."
        actions={(
          <>
            <Link href="/brand/arc-panel-lab" aria-label="Open Arc Panel Lab logo designer">
              <Button variant="primary">Open Arc Panel Lab</Button>
            </Link>
            <Button variant="secondary">Open Brand Brain</Button>
          </>
        )}
      />

      <SurfaceSection title="Brand Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Campaigns" value={activeCampaigns} helper="Live now" />
          <StatCard label="Brand Assets" value={brandAssets.length} helper="Ready" />
          <StatCard label="Primary Tone" value={brand.tone.split(',')[0]} helper="Core voice" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Story & Values">
        <Card className="space-y-4">
          <div>
            <p className="aurora-label text-slate-500 dark:text-slate-400">Brand Story</p>
            <CardTitle>{brand.name}</CardTitle>
          </div>
          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">{brand.story}</p>
          <div className="flex flex-wrap gap-2">
            {brand.values.map((value) => (
              <Badge key={value} size="sm" variant="info">
                {value}
              </Badge>
            ))}
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Tone & Vocabulary">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6">
          <Card className="space-y-3">
            <CardTitle>Voice & Archetype</CardTitle>
            <div className="space-y-2">
              <div>
                <p className="aurora-label text-slate-500 dark:text-slate-400">Tone</p>
                <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{brand.tone}</p>
              </div>
              <div>
                <p className="aurora-label text-slate-500 dark:text-slate-400">Archetype</p>
                <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{brand.archetype}</p>
              </div>
            </div>
          </Card>
          <Card className="space-y-3">
            <CardTitle>Vocabulary</CardTitle>
            <div className="flex flex-wrap gap-2">
              {brand.vocabulary.map((word) => (
                <Badge key={word} size="sm" variant="default">
                  {word}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Asset Library" actions={<Button variant="secondary">Upload Asset</Button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Brand assets">
          {brandAssets.map((asset) => (
            <Card key={asset.id} className="space-y-2" role="listitem">
              <p className="aurora-label text-slate-500 dark:text-slate-400">{asset.kind}</p>
              <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{asset.label}</p>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Updated {asset.updatedAt.toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Campaigns" description="Track and launch cross-channel initiatives.">
        <Card className="space-y-3">
          {brandCampaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="aurora-label text-slate-900 dark:text-slate-50">{campaign.title}</p>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                  {campaign.channel} · Starts {campaign.startsAt.toLocaleDateString()}
                </p>
              </div>
              <Badge size="sm" variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'default'}>
                {campaign.status}
              </Badge>
            </div>
          ))}
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
