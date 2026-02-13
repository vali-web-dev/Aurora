'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';

const routes = AuroraDataService.getRoutes();
const places = AuroraDataService.getSavedPlaces();

export function NavigationUniverse() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">Navigation Universe</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Explore routes, book rides, and navigate your world in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Saved Places" value={places.length} />
        <StatCard label="Active Routes" value={routes.length} />
        <StatCard label="Ride Integrations" value={3} />
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Live Insight</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Typical commute: 24 min • Traffic light today
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Book Ride</Button>
            <Button variant="ghost" size="sm">Share ETA</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Route Planner</h2>
            <Button variant="secondary" size="sm">New Route</Button>
          </div>
          <div className="h-64 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Map Preview</p>
          </div>
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {route.from} → {route.to}
                  </p>
                  <Badge size="sm" variant="info">{route.mode}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {route.durationMinutes} min • {route.distanceMiles.toFixed(1)} mi
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Drive', 'Transit', 'Walk', 'Ride'].map((mode) => (
              <Button key={mode} variant="ghost" size="sm">
                {mode} mode
              </Button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Saved Places</h2>
            <div className="space-y-3">
              {places.map((place) => (
                <div key={place.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{place.name}</p>
                    <Badge size="sm" variant="default">{place.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{place.address}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Ride Options</h2>
            <div className="space-y-3">
              {['Uber', 'Lyft', 'Waze'].map((provider) => (
                <div key={provider} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{provider}</p>
                  <Button variant="ghost" size="sm">Connect</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
