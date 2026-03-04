const http = require('node:http');

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const ports = args
  .filter((entry) => entry !== '--json')
  .map((entry) => Number(entry))
  .filter((entry) => Number.isInteger(entry) && entry > 0);

const resolvedPorts = ports.length > 0 ? ports : [3000, 3001, 3002, 3003, 3004, 3005];

function probe(port) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/health',
        timeout: 2500,
      },
      (res) => {
        resolve({ port, ok: Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 500), status: res.statusCode ?? 0 });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ port, ok: false, status: 0 });
    });
    req.on('error', () => resolve({ port, ok: false, status: 0 }));
  });
}

(async () => {
  const results = await Promise.all(resolvedPorts.map((port) => probe(port)));
  const healthy = results.find((entry) => entry.ok);

  if (jsonMode) {
    const payload = {
      healthy: healthy ? `http://localhost:${healthy.port}/health` : null,
      results,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(payload, null, 2));
    process.exit(healthy ? 0 : 1);
  }

  results.forEach((entry) => {
    console.log(`http://localhost:${entry.port}/health -> ${entry.ok ? entry.status : 'ERROR'}`);
  });

  if (healthy) {
    console.log(`\n[dev:health] Healthy server at http://localhost:${healthy.port}/health`);
    process.exit(0);
  }

  console.log('\n[dev:health] No healthy dev server detected');
  process.exit(1);
})();
