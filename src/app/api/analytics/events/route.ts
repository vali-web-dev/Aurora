/**
 * Events Collection API Route
 * POST /api/analytics/events - Collect events from client/server
 * GET /api/analytics/events - Query events
 */

import { NextRequest } from 'next/server';
import {
  eventStore,
  Event,
  AnalyticsFilter,
  EventCategory,
  EventAction,
} from '@/lib/analytics/events';
import {
  errorResponse,
  successResponse,
  validateQuery,
  validateRequestBody,
} from '@/lib/request-validation';
import {
  analyticsEventsPostSchema,
  analyticsEventsQuerySchema,
} from '@/lib/validations';
import type { z } from 'zod';

type AnalyticsEventsPostPayload = z.infer<typeof analyticsEventsPostSchema>;
type AnalyticsEventsQueryPayload = z.infer<typeof analyticsEventsQuerySchema>;
type AnalyticsEventInput = NonNullable<AnalyticsEventsPostPayload['events']>;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || req.ip || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, analyticsEventsPostSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { events, batch } = validation.data as AnalyticsEventsPostPayload;

    const eventsToStore: Event[] = [];

    const toStoredEvent = (evt: AnalyticsEventInput): Event => ({
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date(evt.timestamp || Date.now()),
      category: evt.category,
      action: evt.action,
      userId: evt.userId,
      sessionId: evt.sessionId,
      orderId: evt.orderId,
      productId: evt.productId,
      value: evt.value,
      metadata: evt.metadata || {},
      source: 'client',
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: getClientIp(req),
    });

    if (batch) {
      eventsToStore.push(...batch.map((evt) => toStoredEvent(evt)));
    } else if (events) {
      eventsToStore.push(toStoredEvent(events));
    }

    // Store events
    eventsToStore.forEach(evt => eventStore.addEvent(evt));

    return successResponse({
      success: true,
      eventsCollected: eventsToStore.length,
      events: eventsToStore.map(e => ({ id: e.id, timestamp: e.timestamp })),
    });
  } catch (error: unknown) {
    console.error('Event collection error:', error);
    return errorResponse('Failed to collect analytics events', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryValidation = validateQuery<AnalyticsEventsQueryPayload>(
      searchParams,
      analyticsEventsQuerySchema
    );
    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { category, action, userId, limit, days } = queryValidation.data;

    const filter: AnalyticsFilter = {
      category: category as EventCategory | undefined,
      action: action as EventAction | undefined,
      userId: userId || undefined,
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      limit,
    };

    const events = eventStore.getEvents(filter);

    return successResponse({
      events,
      count: events.length,
      filter,
    });
  } catch (error: unknown) {
    console.error('Query events error:', error);
    return errorResponse('Failed to query analytics events', 500);
  }
}
