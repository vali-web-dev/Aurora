#!/usr/bin/env node
/**
 * API Endpoint Tester
 * Test single or multiple endpoints with custom methods, headers, and bodies
 *
 * Usage:
 *   npm run api:test -- http://localhost:3000/api/health
 *   npm run api:test -- http://localhost:3000/api/users -m POST -d '{"name":"test"}'
 *   npm run api:test -- http://localhost:3000/api/users -b ./body.json --json
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');

const args = process.argv.slice(2);
const targetUrl = args[0];
const method = (args.includes('-m') ? args[args.indexOf('-m') + 1] : 'GET').toUpperCase();
const dataArg = args.includes('-d') ? args[args.indexOf('-d') + 1] : null;
const bodyFile = args.includes('-b') ? args[args.indexOf('-b') + 1] : null;
const isJSON = args.includes('--json');
const timeout = parseInt(args.find(a => a.startsWith('--timeout'))?.split('=')[1] || '5000', 10);

if (!targetUrl) {
  console.error('❌ Usage: npm run api:test -- <url> [-m METHOD] [-d DATA] [-b FILE] [--json] [--timeout=5000]');
  process.exit(1);
}

async function testEndpoint() {
  try {
    const parsedUrl = new URL(targetUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    let body = null;
    if (bodyFile && fs.existsSync(bodyFile)) {
      body = fs.readFileSync(bodyFile, 'utf-8');
    } else if (dataArg) {
      body = dataArg;
    }

    const startTime = Date.now();
    const response = await makeRequest(protocol, parsedUrl, method, body, timeout);
    const elapsed = Date.now() - startTime;

    const report = {
      timestamp: new Date().toISOString(),
      url: targetUrl,
      method,
      status: response.status,
      elapsed,
      headers: response.headers,
      body: response.body,
      ok: response.status >= 200 && response.status < 300,
    };

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('API ENDPOINT TEST');
      console.log('='.repeat(60));
      console.log(`URL: ${targetUrl}`);
      console.log(`Method: ${method}`);
      console.log(`Status: ${response.status} ${getStatusName(response.status)}`);
      console.log(`Time: ${elapsed}ms`);
      console.log();
      console.log('Response Headers:');
      Object.entries(response.headers).slice(0, 5).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
      });
      if (response.body) {
        console.log('\nBody Preview:');
        const preview = response.body.substring(0, 200);
        console.log(`  ${preview}${response.body.length > 200 ? '...' : ''}`);
      }
      console.log('='.repeat(60) + '\n');
    }

    process.exit(report.ok ? 0 : 1);
  } catch (err) {
    if (isJSON) {
      console.log(JSON.stringify({ error: err.message, timestamp: new Date().toISOString() }, null, 2));
    } else {
      console.error('\n❌ Test failed:', err.message);
    }
    process.exit(1);
  }
}

function makeRequest(protocol, parsedUrl, method, body, timeout) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Aurora-API-Tester/1.0',
      },
      timeout,
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = protocol.request(options, res => {
      let Data = '';
      res.on('data', chunk => { Data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Data,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function getStatusName(code) {
  const names = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
  };
  return names[code] || 'Unknown';
}

testEndpoint();
