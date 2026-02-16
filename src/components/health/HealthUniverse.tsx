'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';

const vitals = AuroraDataService.getHealthVitals();
const activities = AuroraDataService.getActivities();
const goals = AuroraDataService.getHealthGoals();
const nutrition = AuroraDataService.getNutritionEntries();
const sleep = AuroraDataService.getSleepRecords();

const totalCaloriesBurned = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
const totalCaloriesConsumed = nutrition.reduce((sum, n) => sum + n.caloriesEstimated, 0);
const avgSleepDuration = sleep.length > 0 ? (sleep.reduce((sum, s) => sum + s.duration, 0) / sleep.length / 60).toFixed(1) : '0';

export function HealthUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Health & Wellness Universe"
        description="Vitals, activities, nutrition, sleep, and holistic wellness intelligence."
      />

      <SurfaceSection title="Wellness Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Calories Burned" value={totalCaloriesBurned} helper="This week" />
          <StatCard label="Calories Consumed" value={totalCaloriesConsumed} helper="This week" />
          <StatCard label="Avg Sleep" value={`${avgSleepDuration}h`} helper="Last 7 days" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Vitals">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-slate-500 dark:text-slate-400">
                Current Status
              </p>
              <CardTitle>Vitals</CardTitle>
            </div>
            <Badge size="sm" variant="success">Healthy</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list" aria-label="Vitals">
            {vitals.map((vital) => (
              <div key={vital.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                <p className="aurora-label text-slate-500 dark:text-slate-400">
                  {vital.type.replace('_', ' ')}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{vital.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{vital.unit}</p>
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Activity & Recovery">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="secondary" size="sm">Log Activity</Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Recent activities">
              {activities.map((activity) => (
                <div key={activity.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50 capitalize">{activity.type}</p>
                    <Badge size="sm" variant="info">{activity.caloriesBurned} kcal</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activity.duration} min • {activity.distance.toFixed(1)} mi
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <CardTitle>Wellness Goals</CardTitle>
              <div className="space-y-3" role="list" aria-label="Wellness goals">
                {goals.map((goal) => (
                  <div key={goal.id} role="listitem" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{goal.category}</p>
                      <Badge size="sm" variant={goal.status === 'completed' ? 'success' : 'default'}>
                        {goal.currentProgress}%
                      </Badge>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(goal.currentProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <CardTitle>Sleep</CardTitle>
              <div className="space-y-3" role="list" aria-label="Sleep records">
                {sleep.map((record) => (
                  <div key={record.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {(record.duration / 60).toFixed(1)}h
                      </p>
                      <Badge size="sm" variant={record.quality === 'excellent' ? 'success' : record.quality === 'good' ? 'info' : 'warning'}>
                        {record.quality}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {record.deepSleepPercent}% deep sleep
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Today's Nutrition">
        <Card className="space-y-4">
          <div className="space-y-3" role="list" aria-label="Nutrition entries">
            {nutrition.map((entry) => (
              <div key={entry.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50 capitalize">{entry.mealType}</p>
                  <Badge size="sm" variant="info">{entry.caloriesEstimated} kcal</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{entry.items.join(' • ')}</p>
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
