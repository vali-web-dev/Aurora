/**
 * Events Collection API Route
 * POST /api/analytics/events - Collect events from client/server
 * GET /api/analytics/events - Query events
 */

import { NextRequest, NextResponse } from 'next/server';
import { eventStore, Event, AnalyticsFilter } from '@/lib/analytics/events';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || req.ip || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { events, batch } = body;

    if (!events && !batch) {
      return NextResponse.json(
        { error: 'Events or batch data required' },
        { status: 400 }
      );
    }

    const eventsToStore: Event[] = [];

    if (batch) {
      // Process batch of events
      eventsToStore.push(
        ...batch.map((evt: any) => ({
          id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(evt.timestamp || Date.now()),
          category: evt.category,
          action: evt.action,
          userId: evt.userId,
          sessionId: evt.sessionId,
          orderId: evt.orderId,
          productId: evt.productId,
          value: evt.value,
          metadata: evt.metadata || {},
          source: 'client' as const,
          userAgent: req.headers.get('user-agent') || undefined,
          ipAddress: getClientIp(req),
        }))
      );
    } else if (events) {
      // Process single event
      const evt = events;
      eventsToStore.push({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(evt.timestamp || Date.now()),
        category: evt.category,
        action: evt.action,
        userId: evt.userId,
        sessionId: evt.sessionId,
        orderId: evt.orderId,
        productId: evt.productId,
        value: evt.value,
        metadata: evt.metadata || {},
        source: 'client' as const,
        userAgent: req.headers.get('user-agent') || undefined,
        ipAddress: getClientIp(req),
      });
    }

    // Store events
    eventsToStore.forEach(evt => eventStore.addEvent(evt));

    return NextResponse.json({
      success: true,
      eventsCollected: eventsToStore.length,
      events: eventsToStore.map(e => ({ id: e.id, timestamp: e.timestamp })),
    });
  } catch (error: any) {
    console.error('Event collection error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const action = searchParams.get('action') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const days = parseInt(searchParams.get('days') || '7');

    const filter: AnalyticsFilter = {
      category: category as any,
      action: action as any,
      userId: userId || undefined,
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      limit,
    };

    const events = eventStore.getEvents(filter);

    return NextResponse.json({
      events,
      count: events.length,
      filter,
    });
  } catch (error: any) {
    console.error('Query events error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
