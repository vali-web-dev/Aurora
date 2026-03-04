#!/usr/bin/env node
/**
 * Batch Health Checker
 * Check health across multiple endpoints in parallel
 *
 * Usage:
 *   npm run api:health-batch -- --urls urls.json
 *   npm run api:health-batch -- http://localhost:3000/api/health http://localhost:3000/api/users --json
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const args = process.argv.slice(2);
const urlsFileArg = args.find(a => a.startsWith('--urls'))?.split('=')[1];
const isJSON = args.includes('--json');
const timeout = parseInt(args.find(a => a.startsWith('--timeout'))?.split('=')[1] || '5000', 10);

let urls = [];

if (urlsFileArg && fs.existsSync(urlsFileArg)) {
  urls = JSON.parse(fs.readFileSync(urlsFileArg, 'utf-8'));
} else {
  urls = args.filter(a => a.startsWith('http'));
}

if (urls.length === 0) {
  console.error('❌ Usage: npm run api:health-batch -- <url1> <url2> ... OR --urls urls.json');
  process.exit(1);
}

async function batchCheck() {
  try {
    console.log(`\n[Batch Health Check] Testing ${urls.length} endpoint(s)...\n`);

    const checks = urls.map(u => checkEndpoint(u, timeout));
    const results = await Promise.all(checks);

    const report = {
      timestamp: new Date().toISOString(),
      totalEndpoints: urls.length,
      healthy: results.filter(r => r.ok).length,
      unhealthy: results.filter(r => !r.ok).length,
      results,
    };

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('='.repeat(60));
      console.log('BATCH HEALTH CHECK');
      console.log('='.repeat(60));

      results.forEach((r, i) => {
        const icon = r.ok ? '✓' : '✗';
        console.log(`${icon} ${r.url}`);
        console.log(`  Status: ${r.status || 'error'} (${r.elapsed}ms)`);
        if (r.error) console.log(`  Error: ${r.error}`);
      });

      console.log();
      console.log(`Healthy: ${report.healthy}/${urls.length}`);
      console.log('='.repeat(60) + '\n');
    }

    process.exit(report.unhealthy === 0 ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Batch check failed:', err.message);
    process.exit(1);
  }
}

function checkEndpoint(targetUrl, timeout) {
  return new Promise(resolve => {
    try {
      const parsedUrl = new URL(targetUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      const start = Date.now();

      const options = {
        method: 'GET',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        timeout,
      };

      const req = protocol.request(options, res => {
        res.on('data', () => {});
        res.on('end', () => {
          const elapsed = Date.now() - start;
          resolve({
            url: targetUrl,
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            elapsed,
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: targetUrl,
          ok: false,
          error: 'timeout',
          elapsed: timeout,
        });
      });

      req.on('error', err => {
        resolve({
          url: targetUrl,
          ok: false,
          error: err.message,
          elapsed: Date.now() - start,
        });
      });

      req.end();
    } catch (err) {
      resolve({
        url: targetUrl,
        ok: false,
        error: err.message,
      });
    }
  });
}

batchCheck();
