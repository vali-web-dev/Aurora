#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'src', 'app');
const navFiles = [
  path.join(rootDir, 'src', 'lib', 'navigation.ts'),
  path.join(rootDir, 'src', 'lib', 'expandable-navigation.ts'),
];
const pageIconsFile = path.join(rootDir, 'src', 'components', 'aurora', 'PageIcons.tsx');
const reportDir = path.join(rootDir, 'artifacts');
const reportJsonPath = path.join(reportDir, 'navigation-connectivity-report.json');
const reportMdPath = path.join(reportDir, 'navigation-connectivity-report.md');
const failOnIconFallback = process.argv.includes('--fail-on-icon-fallback');

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeRouteFromPageFile(pageFilePath) {
  const relativeDir = path.relative(appDir, path.dirname(pageFilePath));
  if (!relativeDir || relativeDir === '.') {
    return '/';
  }

  const segments = relativeDir
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !segment.startsWith('(') && !segment.startsWith('@'));

  if (!segments.length) {
    return '/';
  }

  return `/${segments.join('/')}`;
}

function classifyRoutes(pageFiles) {
  const staticRoutes = new Set();
  const catchAllBases = new Set();
  const singleDynamicBases = new Set();

  for (const filePath of pageFiles) {
    const route = normalizeRouteFromPageFile(filePath);
    const segments = route === '/' ? [] : route.slice(1).split('/');

    const catchAllIndex = segments.findIndex((segment) => /^\[\[?\.\.\.[^\]]+\]\]?$/.test(segment));
    const dynamicIndex = segments.findIndex((segment) => /^\[[^\].]+\]$/.test(segment));

    if (segments.length === 0) {
      staticRoutes.add('/');
      continue;
    }

    if (catchAllIndex >= 0) {
      const base = `/${segments.slice(0, catchAllIndex).join('/')}`;
      catchAllBases.add(base || '/');
      continue;
    }

    if (dynamicIndex >= 0 && dynamicIndex === segments.length - 1) {
      const base = `/${segments.slice(0, dynamicIndex).join('/')}`;
      singleDynamicBases.add(base || '/');
      continue;
    }

    if (dynamicIndex === -1) {
      staticRoutes.add(route);
    }
  }

  return {
    staticRoutes,
    catchAllBases,
    singleDynamicBases,
  };
}

function extractHrefs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hrefPattern = /href:\s*['"`]([^'"`]+)['"`]/g;
  const hrefs = [];
  let match = null;

  while ((match = hrefPattern.exec(content)) !== null) {
    const href = match[1].trim();
    if (href.startsWith('/')) {
      hrefs.push(href);
    }
  }

  return hrefs;
}

function extractNavEntries(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  const starts = [];
  const objectLiterals = [];

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === '{') {
      starts.push(i);
      continue;
    }

    if (ch === '}' && starts.length > 0) {
      const start = starts.pop();
      objectLiterals.push(content.slice(start, i + 1));
    }
  }

  for (const objectText of objectLiterals) {
    const hrefMatch = objectText.match(/href:\s*['"`]([^'"`]+)['"`]/);
    const labelMatch = objectText.match(/label:\s*['"`]([^'"`]+)['"`]/);
    if (!hrefMatch || !labelMatch) {
      continue;
    }

    const href = hrefMatch[1].trim();
    const label = labelMatch[1].trim();
    if (href.startsWith('/')) {
      entries.push({ href, label });
    }
  }

  return entries;
}

function extractObjectBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    return '';
  }

  const openIndex = source.indexOf('{', markerIndex);
  if (openIndex === -1) {
    return '';
  }

  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openIndex + 1, i);
      }
    }
  }

  return '';
}

function parseStringMap(objectBody) {
  const map = new Map();
  const pairPattern = /(?:'([^']+)'|([A-Za-z0-9_]+))\s*:\s*'([^']+)'/g;
  let match = null;

  while ((match = pairPattern.exec(objectBody)) !== null) {
    const key = (match[1] || match[2] || '').trim();
    const value = (match[3] || '').trim();
    if (key && value) {
      map.set(key, value);
    }
  }

  return map;
}

function normalizeIconKeyFromLabel(label) {
  return String(label || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function parseIconKeys(objectBody) {
  const keys = new Set();
  const keyPattern = /(?:^|\n)\s*(?:'([^']+)'|([A-Za-z][A-Za-z0-9_]*))\s*:\s*\(/g;
  let match = null;

  while ((match = keyPattern.exec(objectBody)) !== null) {
    const key = (match[1] || match[2] || '').trim();
    if (key) {
      keys.add(key);
    }
  }

  return keys;
}

function loadIconResolverData() {
  if (!fs.existsSync(pageIconsFile)) {
    return {
      iconKeys: new Set(['Home']),
      segmentMap: new Map(),
      entertainmentSubsegmentMap: new Map(),
      labelAliasMap: new Map(),
    };
  }

  const content = fs.readFileSync(pageIconsFile, 'utf8');
  const iconsBody = extractObjectBlock(content, 'const ICONS');
  const segmentBody = extractObjectBlock(content, 'const SEGMENT_ICON_MAP');
  const entertainmentSubsegmentBody = extractObjectBlock(content, 'const ENTERTAINMENT_SUBSEGMENT_ICON_MAP');
  const labelAliasBody = extractObjectBlock(content, 'const LABEL_ICON_ALIAS');

  return {
    iconKeys: parseIconKeys(iconsBody),
    segmentMap: parseStringMap(segmentBody),
    entertainmentSubsegmentMap: parseStringMap(entertainmentSubsegmentBody),
    labelAliasMap: parseStringMap(labelAliasBody),
  };
}

function resolveIconName(label, href, iconData) {
  const {
    iconKeys,
    segmentMap,
    entertainmentSubsegmentMap,
    labelAliasMap,
  } = iconData;

  const normalizedKey = normalizeIconKeyFromLabel(label);

  if (iconKeys.has(normalizedKey)) {
    return normalizedKey;
  }

  const normalizedLabel = label.trim().toLowerCase();
  if (labelAliasMap.has(normalizedLabel)) {
    return labelAliasMap.get(normalizedLabel);
  }

  if (href) {
    const segments = href.split('/').filter(Boolean).map((segment) => segment.toLowerCase());
    const topSegment = segments[0] || '';
    const secondSegment = segments[1] || '';
    const normalizedSegment = topSegment.toLowerCase();

    if (normalizedSegment === 'entertainment' && secondSegment && entertainmentSubsegmentMap.has(secondSegment)) {
      return entertainmentSubsegmentMap.get(secondSegment);
    }

    if (segments.length > 1 && normalizedKey) {
      return normalizedKey;
    }

    if (segmentMap.has(normalizedSegment)) {
      return segmentMap.get(normalizedSegment);
    }
  }

  return normalizedKey || 'Home';
}

function isExpectedHomeLabelOrRoute(label, href) {
  const normalizedLabel = label.trim().toLowerCase();
  const normalizedHref = href.trim().toLowerCase();
  return normalizedLabel === 'home' || normalizedHref === '/' || normalizedHref === '/home';
}

function resolveHref(href, classified) {
  const { staticRoutes, catchAllBases, singleDynamicBases } = classified;

  if (staticRoutes.has(href)) {
    return { status: 'ok', reason: 'static' };
  }

  for (const base of catchAllBases) {
    if (href.startsWith(`${base}/`)) {
      return { status: 'ok', reason: `catch-all:${base}` };
    }
  }

  for (const base of singleDynamicBases) {
    if (!href.startsWith(`${base}/`)) {
      continue;
    }
    const rest = href.slice(base.length + 1);
    if (rest.length > 0 && !rest.includes('/')) {
      return { status: 'ok', reason: `dynamic:${base}/[param]` };
    }
  }

  return { status: 'missing', reason: 'no-matching-route' };
}

function main() {
  if (!fs.existsSync(appDir)) {
    console.error('Cannot find src/app directory.');
    process.exit(1);
  }

  const pageFiles = walk(appDir).filter((filePath) => /[\\/]page\.(t|j)sx?$/.test(filePath));
  const classified = classifyRoutes(pageFiles);

  const hrefSources = [];
  const navEntries = [];
  for (const filePath of navFiles) {
    if (!fs.existsSync(filePath)) {
      continue;
    }
    for (const href of extractHrefs(filePath)) {
      hrefSources.push({ href, source: path.relative(rootDir, filePath) });
    }
    for (const entry of extractNavEntries(filePath)) {
      navEntries.push({
        href: entry.href,
        label: entry.label,
        source: path.relative(rootDir, filePath),
      });
    }
  }

  const deduped = new Map();
  for (const item of hrefSources) {
    if (!deduped.has(item.href)) {
      deduped.set(item.href, new Set());
    }
    deduped.get(item.href).add(item.source);
  }

  const results = [];
  for (const [href, sources] of deduped.entries()) {
    const resolution = resolveHref(href, classified);
    results.push({
      href,
      status: resolution.status,
      reason: resolution.reason,
      sources: Array.from(sources),
    });
  }

  results.sort((a, b) => a.href.localeCompare(b.href));
  const missing = results.filter((result) => result.status === 'missing');

  const iconData = loadIconResolverData();
  const iconResults = navEntries.map((entry) => {
    const iconName = resolveIconName(entry.label, entry.href, iconData);
    const expectedHome = isExpectedHomeLabelOrRoute(entry.label, entry.href);
    return {
      ...entry,
      resolvedIcon: iconName,
      fallbackToHome: iconName === 'Home' && !expectedHome,
    };
  });
  const iconFallbacks = iconResults.filter((item) => item.fallbackToHome);

  fs.mkdirSync(reportDir, { recursive: true });

  const jsonReport = {
    generatedAt: new Date().toISOString(),
    totals: {
      uniqueNavLinks: results.length,
      ok: results.length - missing.length,
      missing: missing.length,
      iconEntries: iconResults.length,
      iconFallbacks: iconFallbacks.length,
      staticRoutes: classified.staticRoutes.size,
      catchAllBases: classified.catchAllBases.size,
      singleDynamicBases: classified.singleDynamicBases.size,
    },
    missing,
    iconFallbacks,
    iconResults,
    results,
  };

  fs.writeFileSync(reportJsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');

  const mdLines = [
    '# Navigation Connectivity Report',
    '',
    `Generated: ${jsonReport.generatedAt}`,
    '',
    `- Unique navigation links: ${jsonReport.totals.uniqueNavLinks}`,
    `- Connected links: ${jsonReport.totals.ok}`,
    `- Missing links: ${jsonReport.totals.missing}`,
    `- Icon entries audited: ${jsonReport.totals.iconEntries}`,
    `- Icon fallbacks to Home: ${jsonReport.totals.iconFallbacks}`,
    `- Static routes discovered: ${jsonReport.totals.staticRoutes}`,
    `- Catch-all route bases: ${jsonReport.totals.catchAllBases}`,
    `- Single-dynamic route bases: ${jsonReport.totals.singleDynamicBases}`,
    '',
  ];

  if (missing.length === 0) {
    mdLines.push('## Missing Links', '', 'None.', '');
  } else {
    mdLines.push('## Missing Links', '');
    for (const item of missing) {
      mdLines.push(`- ${item.href} (${item.reason})`);
      mdLines.push(`  - Sources: ${item.sources.join(', ')}`);
    }
    mdLines.push('');
  }

  if (iconFallbacks.length === 0) {
    mdLines.push('## Icon Fallbacks', '', 'None.', '');
  } else {
    mdLines.push('## Icon Fallbacks', '');
    for (const item of iconFallbacks) {
      mdLines.push(`- ${item.label} (${item.href}) -> ${item.resolvedIcon}`);
      mdLines.push(`  - Source: ${item.source}`);
    }
    mdLines.push('');
  }

  fs.writeFileSync(reportMdPath, mdLines.join('\n'), 'utf8');

  console.log(`Navigation audit complete: ${missing.length} missing of ${results.length} links.`);
  console.log(`Icon resolver audit: ${iconFallbacks.length} Home fallbacks of ${iconResults.length} nav entries.`);
  console.log(`JSON: ${path.relative(rootDir, reportJsonPath)}`);
  console.log(`MD: ${path.relative(rootDir, reportMdPath)}`);

  if (missing.length > 0) {
    process.exitCode = 2;
  }

  if (failOnIconFallback && iconFallbacks.length > 0) {
    process.exitCode = process.exitCode || 3;
  }
}

main();
