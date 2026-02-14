/**
 * Custom Next.js Server
 * Integrates Socket.IO WebSocket server with Next.js
 * 
 * Run this with: node server.js
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeWebSocket } = require('./src/lib/websocket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  console.log('[Server] Initializing WebSocket server...');
  initializeWebSocket(server);
  console.log('[Server] WebSocket server initialized on /api/ws');

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`[Server] Ready on http://${hostname}:${port}`);
    console.log(`[Server] WebSocket endpoint: ws://${hostname}:${port}/socket.io`);
  });
});
