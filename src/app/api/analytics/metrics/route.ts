/**
 * Analytics Metrics API Route
 * GET /api/analytics/metrics - Get aggregated metrics for dashboarding
 */

import { NextRequest } from 'next/server';
import { eventStore, EventAction, EventCategory } from '@/lib/analytics/events';
import { errorResponse, successResponse, validateQuery } from '@/lib/request-validation';
import { analyticsMetricsQuerySchema } from '@/lib/validations';
import type { z } from 'zod';

type AnalyticsMetricsQueryPayload = z.infer<typeof analyticsMetricsQuerySchema>;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<AnalyticsMetricsQueryPayload>(
      searchParams,
      analyticsMetricsQuerySchema
    );
    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { category, action } = queryValidation.data;

    const metrics = eventStore.getMetrics(
      category as EventCategory | undefined,
      action as EventAction | undefined
    );

    // Group by date for time-series data
    const timeSeries = new Map<
      string,
      { date: string; metrics: typeof metrics; totalCount: number; totalValue: number }
    >();
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

    return successResponse({
      summary,
      timeSeries: Array.from(timeSeries.values()),
      topActions,
      topValueActions,
      metrics,
    });
  } catch (error: unknown) {
    console.error('Metrics query error:', error);
    return errorResponse('Failed to query analytics metrics', 500);
  }
}
