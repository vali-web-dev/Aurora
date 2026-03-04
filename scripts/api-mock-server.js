#!/usr/bin/env node
/**
 * Mock API Server
 * Simple mock server for testing API clients
 *
 * Usage:
 *   npm run api:mock -- --port 3001
 *   npm run api:mock -- --port 3001 --config mock.json
 */

const http = require('http');

const args = process.argv.slice(2);
const port = parseInt(args.find(a => a.startsWith('--port'))?.split('=')[1] || '3001', 10);

// Mock endpoints
const mockEndpoints = {
  '/api/health': {
    method: 'GET',
    status: 200,
    body: { status: 'healthy', timestamp: new Date().toISOString() },
  },
  '/api/users': {
    method: 'GET',
    status: 200,
    body: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ],
  },
  '/api/users/:id': {
    method: 'GET',
    status: 200,
    body: { id: 1, name: 'Alice', email: 'alice@example.com' },
  },
  '/api/posts': {
    method: 'GET',
    status: 200,
    body: [
      { id: 1, title: 'First Post', content: 'Hello World', userId: 1 },
      { id: 2, title: 'Second Post', content: 'Aurora is great', userId: 2 },
    ],
  },
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Find matching endpoint
  const endpoint = findEndpoint(req.url, req.method);

  if (endpoint) {
    res.writeHead(endpoint.status);
    res.end(JSON.stringify(endpoint.body));
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} → ${endpoint.status}`);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} → 404`);
  }
});

function findEndpoint(url, method) {
  const path = url.split('?')[0];

  // Exact match
  const exact = mockEndpoints[path];
  if (exact && exact.method === method) {
    return exact;
  }

  // Pattern match (e.g., /api/users/:id → /api/users/123)
  for (const [pattern, config] of Object.entries(mockEndpoints)) {
    if (config.method === method && matchPattern(pattern, path)) {
      return config;
    }
  }

  return null;
}

function matchPattern(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, i) => {
    return part.startsWith(':') || part === pathParts[i];
  });
}

server.listen(port, () => {
  console.log(`\n✓ Mock API Server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  Object.keys(mockEndpoints).forEach(path => {
    console.log(`  ${mockEndpoints[path].method} ${path}`);
  });
  console.log('\nPress Ctrl+C to stop\n');
});

process.on('SIGINT', () => {
  console.log('\n✓ Mock server stopped');
  process.exit(0);
});
