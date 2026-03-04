#!/usr/bin/env node
/**
 * API Performance Analyzer
 * Measure response times across routes
 *
 * Usage:
 *   npm run api:perf -- http://localhost:3000/api/health
 *   npm run api:perf -- http://localhost:3000/api/users --samples 20 --json
 */

const http = require('http');
const https = require('https');

const args = process.argv.slice(2);
const targetUrl = args[0];
const method = (args.includes('-m') ? args[args.indexOf('-m') + 1] : 'GET').toUpperCase();
const samples = parseInt(args.find(a => a.startsWith('--samples'))?.split('=')[1] || '10', 10);
const isJSON = args.includes('--json');
const timeout = parseInt(args.find(a => a.startsWith('--timeout'))?.split('=')[1] || '5000', 10);

if (!targetUrl) {
  console.error('❌ Usage: npm run api:perf -- <url> [--samples N] [--json]');
  process.exit(1);
}

async function analyze() {
  try {
    const parsedUrl = new URL(targetUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    console.log(`\n[Performance Analysis] ${samples} samples from ${targetUrl}\n`);

    const times = [];
    const statuses = {};
    let errors = 0;

    for (let i = 0; i < samples; i++) {
      try {
        const start = Date.now();
        const status = await makeRequest(protocol, parsedUrl, method, timeout);
        const elapsed = Date.now() - start;
        times.push(elapsed);
        statuses[status] = (statuses[status] || 0) + 1;
        process.stdout.write(`\r[${i + 1}/${samples}] ${elapsed}ms`);
      } catch (err) {
        errors++;
        process.stdout.write(`\r[${i + 1}/${samples}] Error: ${err.message.substring(0, 20)}`);
      }
    }

    const sorted = times.sort((a, b) => a - b);
    const report = {
      timestamp: new Date().toISOString(),
      url: targetUrl,
      method,
      samples,
      times,
      stats: {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
        median: sorted[Math.floor(sorted.length / 2)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.90)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        stddev: calculateStdDev(times).toFixed(2),
      },
      statusCodes: statuses,
      errors,
    };

    console.log('\n\n' + '='.repeat(60));
    console.log('PERFORMANCE ANALYSIS');
    console.log('='.repeat(60));
    console.log(`Min: ${report.stats.min}ms | Max: ${report.stats.max}ms`);
    console.log(`Mean: ${report.stats.mean}ms | Median: ${report.stats.median}ms`);
    console.log(`P75: ${report.stats.p75}ms | P90: ${report.stats.p90}ms | P99: ${report.stats.p99}ms`);
    console.log(`StdDev: ${report.stats.stddev}ms`);
    console.log(`Status Codes: ${Object.entries(statuses).map(([s, c]) => `${s}:${c}`).join(', ')}`);
    if (errors > 0) console.log(`Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Analysis failed:', err.message);
    process.exit(1);
  }
}

function makeRequest(protocol, parsedUrl, method, timeout) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      timeout,
    };

    const req = protocol.request(options, res => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });

    req.on('error', reject);
    req.end();
  });
}

function calculateStdDev(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

analyze();
