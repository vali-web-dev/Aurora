#!/usr/bin/env node
/**
 * API Load Tester
 * Simple load test with configurable concurrency and request count
 *
 * Usage:
 *   npm run api:load-test -- http://localhost:3000/api/health --count 100 --concurrency 10
 *   npm run api:load-test -- http://localhost:3000/api/users --count 50 --json
 */

const http = require('http');
const https = require('https');
const url = require('url');

const args = process.argv.slice(2);
const targetUrl = args[0];
const method = (args.includes('-m') ? args[args.indexOf('-m') + 1] : 'GET').toUpperCase();
const count = parseInt(args.find(a => a.startsWith('--count'))?.split('=')[1] || '10', 10);
const concurrency = parseInt(args.find(a => a.startsWith('--concurrency'))?.split('=')[1] || '5', 10);
const isJSON = args.includes('--json');
const timeout = parseInt(args.find(a => a.startsWith('--timeout'))?.split('=')[1] || '5000', 10);

if (!targetUrl) {
  console.error('❌ Usage: npm run api:load-test -- <url> [--count N] [--concurrency N] [--json]');
  process.exit(1);
}

async function loadTest() {
  try {
    const parsedUrl = new URL(targetUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const results = {
      url: targetUrl,
      method,
      totalRequests: count,
      concurrency,
      requests: [],
      summary: {},
    };

    console.log(`\n[Load Test] Starting: ${count} requests, ${concurrency} concurrent`);
    console.log(`[Load Test] Target: ${targetUrl}\n`);

    const startTime = Date.now();
    let completed = 0;
    let errors = 0;
    const times = [];

    // Queue management for concurrency
    const queue = [];
    for (let i = 0; i < count; i++) {
      queue.push(i);
    }

    const workers = [];
    for (let w = 0; w < Math.min(concurrency, count); w++) {
      workers.push(processQueue(protocol, parsedUrl, method, timeout, queue, results, times, () => {
        completed++;
        errors += (results.requests[completed - 1].error ? 1 : 0);
        process.stdout.write(`\r[${completed}/${count}] Complete - Errors: ${errors}`);
      }));
    }

    await Promise.all(workers);
    const totalTime = Date.now() - startTime;

    // Calculate stats
    const sorted = times.sort((a, b) => a - b);
    results.summary = {
      totalTime,
      requestsPerSecond: (count / totalTime * 1000).toFixed(2),
      avgTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
      minTime: sorted[0],
      maxTime: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      errors,
      successRate: ((count - errors) / count * 100).toFixed(1),
    };

    console.log('\n\n' + '='.repeat(60));
    console.log('LOAD TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Time: ${results.summary.totalTime}ms`);
    console.log(`Requests/sec: ${results.summary.requestsPerSecond}`);
    console.log(`Avg Response: ${results.summary.avgTime}ms`);
    console.log(`Min/Max: ${results.summary.minTime}ms / ${results.summary.maxTime}ms`);
    console.log(`P50: ${results.summary.p50}ms | P95: ${results.summary.p95}ms | P99: ${results.summary.p99}ms`);
    console.log(`Success Rate: ${results.summary.successRate}% (${errors} errors)`);
    console.log('='.repeat(60) + '\n');

    if (isJSON) {
      console.log(JSON.stringify(results.summary, null, 2));
    }

    process.exit(parseInt(results.summary.successRate) === 100 ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Load test failed:', err.message);
    process.exit(1);
  }
}

function processQueue(protocol, parsedUrl, method, timeout, queue, results, times, onComplete) {
  return (async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      try {
        const start = Date.now();
        const status = await makeRequest(protocol, parsedUrl, method, timeout);
        const elapsed = Date.now() - start;
        times.push(elapsed);
        results.requests.push({ idx, status, elapsed, error: null });
      } catch (err) {
        results.requests.push({ idx, error: err.message });
      }
      onComplete();
    }
  })();
}

function makeRequest(protocol, parsedUrl, method, timeout) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { 'User-Agent': 'Aurora-Load-Tester/1.0' },
      timeout,
    };

    const req = protocol.request(options, res => {
      res.on('data', () => {}); // Drain data
      res.on('end', () => resolve(res.statusCode));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });

    req.on('error', err => reject(err));
    req.end();
  });
}

loadTest();
