/**
 * Analytics Metrics API Route
 * GET /api/analytics/metrics - Get aggregated metrics for dashboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { eventStore } from '@/lib/analytics/events';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const action = searchParams.get('action') || undefined;

    const metrics = eventStore.getMetrics(category as any, action as any);

    // Group by date for time-series data
    const timeSeries = new Map<string, any>();
    metrics.forEach(m => {
      const date = m.date.toISOString().split('T')[0];
      if (!timeSeries.has(date)) {
        timeSeries.set(date, {
          date,
          metrics: [],
          totalCount: 0,
          totalValue: 0,
        });
      }
      const entry = timeSeries.get(date);
      entry.metrics.push(m);
      entry.totalCount += m.count;
      entry.totalValue += m.value || 0;
    });

    // Calculate summaries
    const summary = {
      totalEvents: metrics.reduce((sum, m) => sum + m.count, 0),
      uniqueUsers: new Set(metrics.map(m => m.uniqueUsers)).size,
      totalValue: metrics.reduce((sum, m) => sum + (m.value || 0), 0),
      avgEventValue: metrics.length > 0
        ? Math.round(
            metrics.reduce((sum, m) => sum + (m.value || 0), 0) /
            metrics.reduce((sum, m) => sum + m.count, 0)
          )
        : 0,
    };

    // Top actions by count
    const topActions = metrics
      .filter(m => m.action)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top actions by value
    const topValueActions = metrics
      .filter(m => m.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 10);

    return NextResponse.json({
      summary,
      timeSeries: Array.from(timeSeries.values()),
      topActions,
      topValueActions,
      metrics,
    });
  } catch (error: any) {
    console.error('Metrics query error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
