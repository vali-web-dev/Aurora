import { NextRequest, NextResponse } from 'next/server';

type RouteHandler<TContext = unknown> = (
  request: NextRequest,
  context: TContext
) => Promise<Response>;

function attachTraceHeaders(response: Response, requestId: string, durationMs: number): Response {
  try {
    response.headers.set('x-request-id', requestId);
    response.headers.set('x-response-time-ms', String(durationMs));
    return response;
  } catch {
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'x-request-id': requestId,
        'x-response-time-ms': String(durationMs),
      },
    });
  }
}

export function withApiTrace<TContext = unknown>(
  route: string,
  handler: RouteHandler<TContext>
) {
  return async (request: NextRequest, context: TContext): Promise<Response> => {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const startedAt = Date.now();

    try {
      const response = await handler(request, context);
      const durationMs = Date.now() - startedAt;

      console.info(
        JSON.stringify({
          level: 'info',
          event: 'api.response',
          route,
          method: request.method,
          status: response.status,
          durationMs,
          requestId,
        })
      );

      return attachTraceHeaders(response, requestId, durationMs);
    } catch (error: any) {
      const durationMs = Date.now() - startedAt;
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'api.response.error',
          route,
          method: request.method,
          durationMs,
          requestId,
          message: error?.message || 'Unknown error',
        })
      );
      throw error;
    }
  };
}
