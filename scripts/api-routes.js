#!/usr/bin/env node
/**
 * Route Analyzer
 * Inspect available routes in the application
 *
 * Usage:
 *   npm run api:routes              # Show all detected routes
 *   npm run api:routes --json       # JSON output
 *   npm run api:routes --filter api # Filter by pattern
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isJSON = args.includes('--json');
const filter = args.find(a => a.startsWith('--filter'))?.split('=')[1];

async function analyzeRoutes() {
  try {
    const appDir = path.join(process.cwd(), 'src', 'app');
    const routes = discoverRoutes(appDir, '');

    let filtered = routes;
    if (filter) {
      filtered = routes.filter(r => r.path.includes(filter));
    }

    const report = {
      timestamp: new Date().toISOString(),
      totalRoutes: routes.length,
      filteredRoutes: filtered.length,
      routes: filtered.sort((a, b) => a.path.localeCompare(b.path)),
    };

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('ROUTE ANALYSIS');
      console.log('='.repeat(60));
      console.log(`Total Routes: ${report.totalRoutes}`);
      if (filter) console.log(`Filter: ${filter} (${report.filteredRoutes} matches)`);
      console.log();

      report.routes.forEach((route, i) => {
        const icon = route.dynamic ? '◆' : '◆';
        const type = route.type || 'page';
        console.log(`${i + 1}. ${route.path} [${type}]`);
      });

      console.log();
      console.log('='.repeat(60) + '\n');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Route analysis failed:', err.message);
    process.exit(1);
  }
}

function discoverRoutes(dir, prefix) {
  const routes = [];

  if (!fs.existsSync(dir)) {
    return routes;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    if (entry.name.startsWith('.')) return;
    if (entry.name === 'layout.tsx' || entry.name === 'layout.js') return;

    const fullPath = path.join(dir, entry.name);
    const routeSegment = entry.name.replace(/\.(tsx|ts|jsx|js)$/, '');

    if (entry.isDirectory()) {
      let segment = routeSegment;
      if (routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
        segment = `:${routeSegment.slice(1, -1)}`;
      } else if (routeSegment === '(auth)' || routeSegment.match(/^\([^)]+\)$/)) {
        // Group segment - don't add to path
        routes.push(...discoverRoutes(fullPath, prefix));
        return;
      }

      routes.push(...discoverRoutes(fullPath, prefix + '/' + segment));
    } else if (routeSegment === 'page' && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const route = prefix || '/';
      routes.push({
        path: route,
        dynamic: prefix.includes(':'),
        type: 'page',
        file: entry.name,
      });
    } else if (routeSegment === 'route' && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      const route = (prefix || '/').replace(/\/$/, '') + '/[handler]';
      routes.push({
        path: route,
        dynamic: true,
        type: 'api',
        file: entry.name,
      });
    }
  });

  return routes;
}

analyzeRoutes();
