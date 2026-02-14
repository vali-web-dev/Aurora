/**
 * WebSocket API Route
 * Handles Socket.IO WebSocket connections
 * 
 * Note: This is a special route that works with the WebSocket server
 * initialized in next.config.js via custom server
 */

import { NextRequest } from 'next/server';
import { getWebSocketServer } from '@/lib/websocket-server';

/**
 * WebSocket endpoint
 * In production, this route is handled by Socket.IO middleware
 * The WebSocket server is initialized in the custom Next.js server
 * 
 * This route acts as documentation/health check for the WebSocket endpoint
 */
export async function GET(request: NextRequest) {
  const server = getWebSocketServer();

  if (!server) {
    return Response.json(
      {
        error: 'WebSocket server not initialized',
        endpoint: '/api/ws',
        status: 'unavailable',
      },
      { status: 503 }
    );
  }

  return Response.json({
    status: 'ok',
    endpoint: '/api/ws',
    message: 'WebSocket server is running',
    path: process.env.NODE_ENV === 'development' ? '/api/ws' : '/socket.io',
    supported_events: [
      'connect',
      'disconnect',
      'authenticate',
      'post:create',
      'post:reaction',
      'post:comment',
      'message:new',
      'typing:indicator',
      'presence:update',
      'sync:request',
    ],
  });
}

/**
 * POST not supported for WebSocket endpoint
 */
export async function POST(request: NextRequest) {
  return Response.json(
    {
      error: 'WebSocket endpoint does not support POST requests',
      hint: 'Use Socket.IO client library to establish WebSocket connection',
    },
    { status: 405 }
  );
}
