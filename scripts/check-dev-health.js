const http = require('node:http');

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const ports = args
  .filter((entry) => entry !== '--json')
  .map((entry) => Number(entry))
  .filter((entry) => Number.isInteger(entry) && entry > 0);

const resolvedPorts = ports.length > 0 ? ports : [3000, 3001, 3002, 3003, 3004, 3005];

function probePath(port, path) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path,
        timeout: 2500,
      },
      (res) => {
        resolve({ port, ok: Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 500), status: res.statusCode ?? 0, path });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ port, ok: false, status: 0, path });
    });
    req.on('error', () => resolve({ port, ok: false, status: 0, path }));
  });
}

async function probe(port) {
  const apiHealth = await probePath(port, '/api/health');
  if (apiHealth.ok) return apiHealth;

  const legacyHealth = await probePath(port, '/health');
  if (legacyHealth.ok) return legacyHealth;

  return apiHealth;
}

(async () => {
  const results = await Promise.all(resolvedPorts.map((port) => probe(port)));
  const healthy = results.find((entry) => entry.ok);

  if (jsonMode) {
    const payload = {
      healthy: healthy ? `http://localhost:${healthy.port}${healthy.path}` : null,
      results,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(payload, null, 2));
    process.exit(healthy ? 0 : 1);
  }

  results.forEach((entry) => {
    console.log(`http://localhost:${entry.port}${entry.path} -> ${entry.ok ? entry.status : 'ERROR'}`);
  });

  if (healthy) {
    console.log(`\n[dev:health] Healthy server at http://localhost:${healthy.port}${healthy.path}`);
    process.exit(0);
  }

  console.log('\n[dev:health] No healthy dev server detected');
  process.exit(1);
})();
