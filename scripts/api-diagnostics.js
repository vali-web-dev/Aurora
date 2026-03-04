#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { spawn, spawnSync } = require('child_process');
const net = require('net');

const args = process.argv.slice(2);

function hasFlag(flag) {
  return args.includes(flag);
}

function getArgValue(name, defaultValue = null) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return defaultValue;
}

function getNumberArg(name, defaultValue) {
  const raw = getArgValue(name, String(defaultValue));
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function getListArg(name, defaultValue = []) {
  const raw = getArgValue(name);
  if (!raw) return defaultValue;
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const jsonSummaryMode = hasFlag('--json-summary');
const asJson = hasFlag('--json') || jsonSummaryMode;
const summaryMode = hasFlag('--summary');
const strictMode = hasFlag('--strict');
const allowSkip = hasFlag('--allow-skip');
const diffMode = hasFlag('--diff');
const autoStartDev = hasFlag('--auto-start-dev');
const ndjsonMode = hasFlag('--ndjson');
const traceMode = hasFlag('--trace');
const retries = Math.max(0, getNumberArg('--retries', 0));
const retryDelayMs = Math.max(0, getNumberArg('--retry-delay-ms', 500));
let timeoutMs = Math.max(250, getNumberArg('--timeout-ms', 3500));
let perfSamples = Math.max(1, getNumberArg('--samples', 5));
const watchEverySec = getNumberArg('--watch', hasFlag('--watch') ? 30 : 0);
const outFile = getArgValue('--out');
const htmlOut = getArgValue('--html-out');
const webhookUrl = getArgValue('--webhook-url', process.env.API_DIAG_WEBHOOK_URL || null);
const authTokenEnv = getArgValue('--auth-token-env', 'API_TOKEN');
const authHeaderRaw = getArgValue('--auth-header');
const authCookieEnv = getArgValue('--auth-cookie-env', 'API_AUTH_COOKIE');
const authCookieRaw = getArgValue('--auth-cookie');
const openApiFile = getArgValue('--openapi');
const openApiPaths = getListArg('--openapi-paths', [
  '/api/docs/openapi.json',
  '/api/docs/openapi.yaml',
  '/api/openapi.json',
  '/openapi.json',
  '/swagger.json',
]);
const openApiAuto = hasFlag('--openapi-auto') || !openApiFile;
const historyDir = getArgValue('--history-dir', path.join('.aurora', 'diag-history'));
const ghaSummaryPath = hasFlag('--gha-summary')
  ? getArgValue('--gha-summary', process.env.GITHUB_STEP_SUMMARY || null)
  : process.env.GITHUB_STEP_SUMMARY || null;
const explicitBase = (getArgValue('--base') || '').replace(/\/$/, '') || null;
const matrixPreset = getArgValue('--matrix-preset');
let matrixBases = getListArg('--matrix', []);
const ports = getListArg('--ports', ['3000', '3001', '3002', '3003', '3004', '3005'])
  .map((value) => Number(value))
  .filter((value) => Number.isFinite(value));
const endpointPreset = getArgValue('--endpoint-preset', getArgValue('--universe'));
const preset = getArgValue('--preset');
const smokePreset = preset === 'smoke' || hasFlag('--smoke');
const schemaContractFile = getArgValue('--schema-contract');
const baselineFile = getArgValue('--baseline', path.join('artifacts', 'api-diagnostics.baseline.json'));
const writeBaseline = hasFlag('--write-baseline');
const regressionProfile = getArgValue('--regression-profile', 'balanced');
const authEndpoints = getListArg('--auth-endpoints', ['/api/users/profile']);
const preflightEnv = getListArg('--preflight-env', ['DATABASE_URL', 'NEXTAUTH_SECRET']);
const dependencyTargets = getListArg('--dependency-targets', []);
const dependencyConfigFile = getArgValue('--dependency-config');
const dependencyTimeoutMs = Math.max(300, getNumberArg('--dependency-timeout-ms', 2200));
const sloFile = getArgValue('--slo-file');
const sloSamples = Math.max(1, getNumberArg('--slo-samples', 3));
const sloMaxEndpoints = Math.max(1, getNumberArg('--slo-max-endpoints', 10));
const rerunOnFail = hasFlag('--rerun-on-fail');
const flakyWindow = Math.max(2, getNumberArg('--flaky-window', 8));
const flakyFailScore = Math.max(0, Math.min(100, getNumberArg('--flaky-fail-score', 75)));

const profile = getArgValue('--profile', 'balanced');
const profileThresholds = {
  strict: { latencyWarnMs: 300, latencyFailMs: 800, errorRateWarn: 0.02, errorRateFail: 0.1 },
  balanced: { latencyWarnMs: 500, latencyFailMs: 1200, errorRateWarn: 0.05, errorRateFail: 0.2 },
  lenient: { latencyWarnMs: 900, latencyFailMs: 2200, errorRateWarn: 0.15, errorRateFail: 0.35 },
};

const thresholdBase = profileThresholds[profile] || profileThresholds.balanced;
const thresholds = {
  latencyWarnMs: getNumberArg('--latency-warn-ms', thresholdBase.latencyWarnMs),
  latencyFailMs: getNumberArg('--latency-fail-ms', thresholdBase.latencyFailMs),
  errorRateWarn: Number(getArgValue('--error-rate-warn', String(thresholdBase.errorRateWarn))),
  errorRateFail: Number(getArgValue('--error-rate-fail', String(thresholdBase.errorRateFail))),
};

const matrixPresetDefaults = {
  dev: ['http://localhost:3000', 'http://localhost:3001'],
  stage: [process.env.AURORA_STAGE_URL].filter(Boolean),
  prod: [process.env.AURORA_PROD_URL].filter(Boolean),
};

if (matrixPreset && matrixPresetDefaults[matrixPreset]) {
  matrixBases = matrixPresetDefaults[matrixPreset];
}

const regressionProfiles = {
  strict: { p95IncreasePct: 0.1, errorRateIncrease: 0.01, failIncrease: 1 },
  balanced: { p95IncreasePct: 0.25, errorRateIncrease: 0.03, failIncrease: 1 },
  lenient: { p95IncreasePct: 0.5, errorRateIncrease: 0.05, failIncrease: 2 },
};
const regressionThresholds = regressionProfiles[regressionProfile] || regressionProfiles.balanced;

const includeEndpoints = getListArg('--include-endpoints', []);
const excludeEndpoints = new Set(getListArg('--exclude-endpoints', []));
const defaultEndpoints = ['/api/health', '/api/health/db'];
const endpointPresets = {
  brand: ['/api/brand'],
  commerce: ['/api/commerce'],
  communities: ['/api/communities'],
  entertainment: ['/api/entertainment'],
  learning: ['/api/learning'],
  social: ['/api/social'],
  users: ['/api/users'],
  notifications: ['/api/notifications'],
  services: ['/api/services'],
  health: ['/api/health'],
  auth: ['/api/auth'],
};

let endpoints = (includeEndpoints.length > 0 ? includeEndpoints : defaultEndpoints).filter(
  (endpoint) => !excludeEndpoints.has(endpoint)
);

if (smokePreset) {
  perfSamples = Math.max(1, Math.min(perfSamples, 1));
  timeoutMs = Math.min(timeoutMs, 2000);
  endpoints = ['/api/health'];
}

const authHeaders = {};
if (authHeaderRaw && authHeaderRaw.includes(':')) {
  const splitIndex = authHeaderRaw.indexOf(':');
  const headerName = authHeaderRaw.slice(0, splitIndex).trim();
  const headerValue = authHeaderRaw.slice(splitIndex + 1).trim();
  if (headerName && headerValue) authHeaders[headerName] = headerValue;
}
const token = process.env[authTokenEnv];
if (token && !authHeaders.Authorization) {
  authHeaders.Authorization = `Bearer ${token}`;
}
const authCookie = authCookieRaw || process.env[authCookieEnv] || null;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[index];
}

function parseApiRoutesReport(raw) {
  try {
    const parsed = JSON.parse(raw);
    const apiRoutes = (parsed.routes || []).filter((route) => route.type === 'api').map((route) => route.path);
    return { ok: true, apiRoutes, totalRoutes: parsed.totalRoutes || 0 };
  } catch {
    return { ok: false, apiRoutes: [], totalRoutes: 0 };
  }
}

function normalizeRouteForOpenApi(routePath) {
  return routePath
    .replace('/[handler]', '')
    .replace(/:\.\.\.([A-Za-z0-9_]+)/g, '{$1}')
    .replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function resolveEndpoints(discoveredRoutes) {
  if (includeEndpoints.length > 0) {
    return includeEndpoints.filter((endpoint) => !excludeEndpoints.has(endpoint));
  }

  if (endpointPreset && endpointPresets[endpointPreset]) {
    const prefixes = endpointPresets[endpointPreset];
    const matches = discoveredRoutes.filter((route) => prefixes.some((prefix) => route.startsWith(prefix)));
    if (matches.length > 0) {
      return matches.filter((endpoint) => !excludeEndpoints.has(endpoint));
    }
  }

  return endpoints;
}

function readJsonFileSafe(filePath) {
  if (!filePath) return null;
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function loadSchemaContract() {
  const builtIn = {
    '/api/health': ['status'],
    '/api/health/db': ['status'],
  };
  if (!schemaContractFile) return builtIn;
  const parsed = readJsonFileSafe(schemaContractFile);
  if (!parsed) return builtIn;
  if (parsed.endpoints && typeof parsed.endpoints === 'object') {
    return { ...builtIn, ...parsed.endpoints };
  }
  return { ...builtIn, ...parsed };
}

function hasNestedField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return false;
    current = current[part];
  }
  return true;
}

function buildUniverseCoverage(discoveredRoutes) {
  const universeLabels = {
    brand: 'Brand',
    commerce: 'Commerce',
    communities: 'Communities',
    entertainment: 'Entertainment',
    learning: 'Learning',
    social: 'Social',
    users: 'Identity',
    notifications: 'Notifications',
    services: 'Automation',
    health: 'Health',
    auth: 'Auth',
  };
  const coverage = {
    total: discoveredRoutes.length,
    byUniverse: {},
    unclassified: 0,
  };

  for (const route of discoveredRoutes) {
    const trimmed = route.replace(/^\/api\//, '');
    const segment = trimmed.split('/')[0];
    const label = universeLabels[segment];
    if (!label) {
      coverage.unclassified += 1;
      continue;
    }
    coverage.byUniverse[label] = (coverage.byUniverse[label] || 0) + 1;
  }

  return coverage;
}

function loadSloConfig() {
  const defaults = {
    default: {
      p95Ms: thresholds.latencyFailMs,
      errorRate: thresholds.errorRateFail,
    },
    routes: {},
  };
  if (!sloFile) return defaults;
  const fullPath = path.isAbsolute(sloFile) ? sloFile : path.join(process.cwd(), sloFile);
  const parsed = readJsonFileSafe(fullPath);
  if (!parsed) return defaults;
  return {
    default: {
      p95Ms: Number(parsed.default?.p95Ms ?? defaults.default.p95Ms),
      errorRate: Number(parsed.default?.errorRate ?? defaults.default.errorRate),
    },
    routes: parsed.routes || {},
  };
}

function buildDependencyTargetList(baseUrl) {
  const defaults = baseUrl
    ? [`${baseUrl}/api/health`, `${baseUrl}/api/health/db`]
    : [];
  return dependencyTargets.length > 0 ? dependencyTargets : defaults;
}

function loadDependencyConfig() {
  if (!dependencyConfigFile) return null;
  const fullPath = path.isAbsolute(dependencyConfigFile)
    ? dependencyConfigFile
    : path.join(process.cwd(), dependencyConfigFile);
  const parsed = readJsonFileSafe(fullPath);
  if (!parsed || !Array.isArray(parsed.targets)) return null;
  return parsed.targets;
}

function probeTcp(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const finish = (ok, status) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, status, elapsed: Date.now() - startedAt });
    };

    socket.setTimeout(timeoutMs);
    socket.once('error', (error) => finish(false, error.code || 'error'));
    socket.once('timeout', () => finish(false, 'timeout'));
    socket.connect(port, host, () => finish(true, 'open'));
  });
}

function listRecentHistory(windowSize) {
  try {
    if (!fs.existsSync(historyDir)) return [];
    const files = fs
      .readdirSync(historyDir)
      .filter((name) => /^api-diag-.*\.json$/.test(name))
      .sort((a, b) => a.localeCompare(b))
      .slice(-windowSize)
      .map((name) => path.join(historyDir, name));
    return files
      .map((filePath) => readJsonFileSafe(filePath))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function runPreflightEnvCheck() {
  const startedAt = Date.now();
  const required = preflightEnv.filter(Boolean);
  if (required.length === 0) {
    return {
      name: 'preflight-env',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no required env list configured).',
      missing: [],
    };
  }

  const missing = required.filter((name) => !process.env[name] || String(process.env[name]).trim().length === 0);
  const ok = missing.length === 0;
  return {
    name: 'preflight-env',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    required,
    missing,
  };
}

async function runDependencyChecks(baseUrl) {
  const configTargets = loadDependencyConfig();
  const targets = configTargets || buildDependencyTargetList(baseUrl);
  if (!targets || targets.length === 0) {
    return {
      name: 'dependencies',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no dependency targets configured).',
      targets: [],
    };
  }

  const startedAt = Date.now();
  const results = [];
  for (const target of targets) {
    if (typeof target === 'string') {
      const response = await httpRequest(target, 'GET', dependencyTimeoutMs, authHeaders);
      results.push({
        type: 'http',
        target,
        ok: response.ok,
        status: response.status,
        elapsed: response.elapsed,
      });
      continue;
    }

    const type = String(target.type || 'http');
    if (type === 'tcp') {
      const host = target.host || '127.0.0.1';
      const port = Number(target.port || 0);
      const name = target.name || `${host}:${port}`;
      const response = await probeTcp(host, port, dependencyTimeoutMs);
      results.push({
        type: 'tcp',
        target: name,
        ok: response.ok,
        status: response.status,
        elapsed: response.elapsed,
      });
    } else {
      const url = target.url || target.target;
      const name = target.name || url;
      if (target.requireHttps && url && !String(url).startsWith('https://')) {
        results.push({
          type: 'http',
          target: name,
          ok: false,
          status: 'insecure',
          elapsed: 0,
        });
        continue;
      }
      const method = String(target.method || 'GET').toUpperCase();
      const headers = { ...authHeaders, ...(target.headers || {}) };
      const response = await httpRequest(url, method, dependencyTimeoutMs, headers);
      const expected = Array.isArray(target.expectStatus) ? target.expectStatus : null;
      const ok = expected ? expected.includes(response.status) : response.ok;
      results.push({
        type: 'http',
        target: name,
        ok,
        status: response.status,
        elapsed: response.elapsed,
      });
    }
  }

  const ok = results.every((item) => item.ok);
  return {
    name: 'dependencies',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    targets: results,
  };
}

async function runRouteSloCheck(baseUrl, endpointsToCheck) {
  if (!baseUrl) {
    return {
      name: 'route-slo',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no local API server detected).',
      routes: [],
    };
  }

  const startedAt = Date.now();
  const config = loadSloConfig();
  const routes = endpointsToCheck.slice(0, sloMaxEndpoints);
  const routeReports = [];

  for (const route of routes) {
    const latencies = [];
    let errors = 0;
    const routeThreshold = {
      p95Ms: Number(config.routes?.[route]?.p95Ms ?? config.default.p95Ms),
      errorRate: Number(config.routes?.[route]?.errorRate ?? config.default.errorRate),
    };

    for (let i = 0; i < sloSamples; i += 1) {
      const response = await httpRequest(`${baseUrl}${route}`, 'GET', timeoutMs, authHeaders);
      if (response.ok) latencies.push(response.elapsed);
      else errors += 1;
    }

    const p95 = percentile(latencies, 95);
    const errorRate = sloSamples === 0 ? 0 : errors / sloSamples;
    const routeOk = p95 <= routeThreshold.p95Ms && errorRate <= routeThreshold.errorRate;
    routeReports.push({
      route,
      ok: routeOk,
      p95,
      errorRate,
      threshold: routeThreshold,
      samples: sloSamples,
      successes: latencies.length,
      errors,
    });
  }

  const ok = routeReports.every((item) => item.ok);
  return {
    name: 'route-slo',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    routes: routeReports,
  };
}

function runFlakyCheck(currentHealthCheck) {
  const healthResults = currentHealthCheck?.results || [];
  if (healthResults.length === 0) {
    return {
      name: 'flaky-score',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no endpoint health results to score).',
      score: 0,
      endpoints: [],
    };
  }

  const startedAt = Date.now();
  const previousRuns = listRecentHistory(flakyWindow);
  const endpointReports = [];

  for (const endpointResult of healthResults) {
    const endpoint = endpointResult.endpoint;
    const sequence = [];
    for (const run of previousRuns) {
      const healthCheck = run.checks?.find((check) => check.name === 'health-batch');
      const result = healthCheck?.results?.find((item) => item.endpoint === endpoint);
      if (result && typeof result.ok === 'boolean') sequence.push(result.ok ? 1 : 0);
    }
    sequence.push(endpointResult.ok ? 1 : 0);

    if (sequence.length < 2) {
      endpointReports.push({ endpoint, score: 0, transitions: 0, failureRate: 0, samples: sequence.length });
      continue;
    }

    let transitions = 0;
    for (let i = 1; i < sequence.length; i += 1) {
      if (sequence[i] !== sequence[i - 1]) transitions += 1;
    }

    const failures = sequence.filter((value) => value === 0).length;
    const failureRate = failures / sequence.length;
    const transitionRate = transitions / (sequence.length - 1);
    const score = Math.round(Math.min(1, transitionRate * 0.7 + failureRate * 0.3) * 100);
    endpointReports.push({
      endpoint,
      score,
      transitions,
      failureRate,
      samples: sequence.length,
    });
  }

  const maxScore = endpointReports.reduce((acc, item) => Math.max(acc, item.score), 0);
  const ok = maxScore < flakyFailScore;
  return {
    name: 'flaky-score',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    score: maxScore,
    threshold: flakyFailScore,
    endpoints: endpointReports,
  };
}

function classifyRerunTriage(firstSummary, rerunSummary) {
  if (!rerunSummary) {
    return { ran: false, classification: 'none' };
  }

  if (firstSummary.ok) {
    return { ran: true, classification: 'not-needed' };
  }

  if (rerunSummary.ok) {
    const flakyScore = firstSummary.checks?.find((check) => check.name === 'flaky-score')?.score || 0;
    return {
      ran: true,
      classification: flakyScore >= Math.round(flakyFailScore * 0.7) ? 'flaky-recovered' : 'transient-recovered',
      flakyScore,
    };
  }

  return { ran: true, classification: 'persistent-failure' };
}

async function fetchOpenApiSpec(baseUrl) {
  if (!baseUrl) return null;
  for (const candidate of openApiPaths) {
    const url = `${baseUrl}${candidate}`;
    const response = await httpRequest(url, 'GET', timeoutMs, authHeaders);
    if (!response.ok || !response.body) continue;
    try {
      const spec = JSON.parse(response.body);
      if (spec && typeof spec === 'object') {
        return { spec, source: url };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function toJUnit(summary) {
  const total = summary.checks.length;
  const failures = summary.checks.filter((check) => !check.ok && !check.skipped).length;
  const skipped = summary.checks.filter((check) => check.skipped).length;
  const testcases = summary.checks
    .map((check) => {
      const attrs = `name="${check.name}" time="${(check.durationMs || 0) / 1000}"`;
      if (check.skipped) {
        return `<testcase ${attrs}><skipped message="${escapeXml(check.note || 'skipped')}"/></testcase>`;
      }
      if (!check.ok) {
        return `<testcase ${attrs}><failure message="exitCode=${check.exitCode || 1}"/></testcase>`;
      }
      return `<testcase ${attrs}/>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="api-diagnostics" tests="${total}" failures="${failures}" skipped="${skipped}">${testcases}</testsuite>\n`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function writeFileSafe(filePath, contents) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf-8');
}

function httpRequest(targetUrl, method = 'GET', requestTimeoutMs = timeoutMs, headers = {}) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      resolve({ ok: false, status: 'bad_url', elapsed: 0, body: '', json: null });
      return;
    }

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(
      {
        method,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        timeout: requestTimeoutMs,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {}
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            status: res.statusCode,
            elapsed: Date.now() - startedAt,
            body,
            json,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 'timeout', elapsed: requestTimeoutMs, body: '', json: null });
    });
    req.on('error', (error) => {
      resolve({ ok: false, status: error.code || 'error', elapsed: Date.now() - startedAt, body: '', json: null });
    });
    req.end();
  });
}

async function resolveBaseUrl(preferredBase) {
  if (preferredBase) return preferredBase;
  for (const port of ports) {
    const base = `http://localhost:${port}`;
    const check = await httpRequest(`${base}/api/health`, 'GET', 1200, authHeaders);
    if (check.ok || (typeof check.status === 'number' && check.status < 500)) return base;
  }
  return null;
}

async function maybeAutoStartDevAndResolve(baseUrl) {
  if (baseUrl || !autoStartDev) return baseUrl;

  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(cmd, ['run', 'dev'], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
    shell: true,
  });
  child.unref();

  const maxWaitSec = Math.max(3, getNumberArg('--auto-start-timeout', 20));
  const startedAt = Date.now();
  while ((Date.now() - startedAt) / 1000 < maxWaitSec) {
    const resolved = await resolveBaseUrl(null);
    if (resolved) return resolved;
    await delay(1000);
  }

  return null;
}

function runCommandWithRetry(name, command, commandArgs) {
  let attempt = 0;
  let lastResult = null;

  while (attempt <= retries) {
    const startedAt = Date.now();
    const result = spawnSync(command, commandArgs, {
      stdio: asJson || summaryMode ? 'pipe' : 'inherit',
      shell: true,
      encoding: 'utf-8',
    });

    lastResult = {
      name,
      ok: result.status === 0,
      exitCode: result.status ?? 1,
      durationMs: Date.now() - startedAt,
      startedAt,
      attempts: attempt + 1,
      stdout: asJson && !jsonSummaryMode ? (result.stdout || '').trim() : undefined,
      stderr: asJson && !jsonSummaryMode ? (result.stderr || '').trim() : undefined,
    };

    if (lastResult.ok) return lastResult;
    attempt += 1;
    if (attempt <= retries) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, retryDelayMs);
    }
  }

  return lastResult;
}

async function runHealthBatch(baseUrl, endpointsToCheck) {
  if (!baseUrl) {
    return {
      name: 'health-batch',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no local API server detected; run `npm run dev` and retry).',
      results: [],
    };
  }

  const startedAt = Date.now();
  const results = [];

  for (const endpoint of endpointsToCheck) {
    const response = await httpRequest(`${baseUrl}${endpoint}`, 'GET', timeoutMs, authHeaders);
    results.push({ endpoint, ...response });
  }

  const ok = results.every((result) => result.ok);
  return {
    name: 'health-batch',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    attempts: 1,
    results,
  };
}

async function runPerf(baseUrl, endpointsToCheck) {
  if (!baseUrl) {
    return {
      name: 'perf',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no local API server detected; run `npm run dev` and retry).',
      metrics: null,
    };
  }

  const endpoint = endpointsToCheck[0] || '/api/health';
  const targetUrl = `${baseUrl}${endpoint}`;
  const startedAt = Date.now();
  const latencies = [];
  let errors = 0;

  for (let i = 0; i < perfSamples; i += 1) {
    const response = await httpRequest(targetUrl, 'GET', timeoutMs, authHeaders);
    if (response.ok) latencies.push(response.elapsed);
    else errors += 1;
  }

  const errorRate = perfSamples === 0 ? 0 : errors / perfSamples;
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const mean = latencies.length ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length : 0;

  const ok = errorRate <= thresholds.errorRateFail && p95 <= thresholds.latencyFailMs;
  const severity =
    errorRate > thresholds.errorRateFail || p95 > thresholds.latencyFailMs
      ? 'fail'
      : errorRate > thresholds.errorRateWarn || p95 > thresholds.latencyWarnMs
      ? 'warn'
      : 'ok';

  return {
    name: 'perf',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    attempts: 1,
    metrics: {
      endpoint,
      samples: perfSamples,
      successes: latencies.length,
      errors,
      errorRate,
      mean,
      p95,
      p99,
      thresholds,
      severity,
    },
  };
}

function runRoutesCheck() {
  const check = runCommandWithRetry('routes', 'node', ['scripts/api-routes.js', '--json']);
  const parsed = parseApiRoutesReport(check.stdout || '');
  return {
    ...check,
    discoveredApiRoutes: parsed.apiRoutes,
    totalRoutes: parsed.totalRoutes,
    parseOk: parsed.ok,
  };
}

async function runOpenApiConformance(discoveredApiRoutes, baseUrl) {
  if (!openApiFile && !openApiAuto) {
    return {
      name: 'openapi-conformance',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no OpenAPI source configured).',
    };
  }

  const startedAt = Date.now();
  try {
    let spec = null;
    let source = null;

    if (openApiFile) {
      const fullPath = path.isAbsolute(openApiFile) ? openApiFile : path.join(process.cwd(), openApiFile);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      spec = JSON.parse(raw);
      source = fullPath;
    } else if (openApiAuto) {
      const fetched = await fetchOpenApiSpec(baseUrl);
      if (fetched) {
        spec = fetched.spec;
        source = fetched.source;
      }
    }

    if (!spec) {
      return {
        name: 'openapi-conformance',
        ok: true,
        skipped: true,
        exitCode: 0,
        durationMs: Date.now() - startedAt,
        note: 'Skipped (OpenAPI spec not found).',
      };
    }

    const openapiPaths = Object.keys(spec.paths || {});
    const normalizedDiscovered = discoveredApiRoutes.map(normalizeRouteForOpenApi);
    const missingInSpec = normalizedDiscovered.filter((route) => !openapiPaths.includes(route));
    const missingInCode = openapiPaths.filter((specPath) => !normalizedDiscovered.includes(specPath));
    const ok = missingInSpec.length === 0;

    return {
      name: 'openapi-conformance',
      ok,
      exitCode: ok ? 0 : 1,
      durationMs: Date.now() - startedAt,
      missingInSpec,
      missingInCode,
      totalSpecPaths: openapiPaths.length,
      totalDiscoveredPaths: normalizedDiscovered.length,
      source,
    };
  } catch (error) {
    return {
      name: 'openapi-conformance',
      ok: false,
      exitCode: 1,
      durationMs: Date.now() - startedAt,
      error: `Unable to parse OpenAPI spec: ${error.message}`,
    };
  }
}

async function runSchemaSanity(baseUrl) {
  if (!baseUrl) {
    return {
      name: 'schema-sanity',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no local API server detected).',
      checks: [],
    };
  }

  const startedAt = Date.now();
  const schemaChecks = [];

  const health = await httpRequest(`${baseUrl}/api/health`, 'GET', timeoutMs, authHeaders);
  schemaChecks.push({
    endpoint: '/api/health',
    ok: !!(health.ok && health.json && typeof health.json === 'object' && 'status' in health.json),
  });

  const healthDb = await httpRequest(`${baseUrl}/api/health/db`, 'GET', timeoutMs, authHeaders);
  schemaChecks.push({
    endpoint: '/api/health/db',
    ok: !!(healthDb.ok && healthDb.json && typeof healthDb.json === 'object'),
  });

  const ok = schemaChecks.every((item) => item.ok);
  return {
    name: 'schema-sanity',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    checks: schemaChecks,
  };
}

async function runSchemaContract(baseUrl) {
  if (!baseUrl) {
    return {
      name: 'schema-contract',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no local API server detected).',
      checks: [],
    };
  }

  const contract = loadSchemaContract();
  const entries = Object.entries(contract);
  if (entries.length === 0) {
    return {
      name: 'schema-contract',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no schema contract endpoints configured).',
      checks: [],
    };
  }

  const startedAt = Date.now();
  const checks = [];

  for (const [endpoint, fields] of entries) {
    const response = await httpRequest(`${baseUrl}${endpoint}`, 'GET', timeoutMs, authHeaders);
    const missingFields = [];
    if (response.ok && response.json && typeof response.json === 'object') {
      for (const field of fields || []) {
        if (!hasNestedField(response.json, field)) missingFields.push(field);
      }
    } else {
      missingFields.push(...(fields || []));
    }

    checks.push({
      endpoint,
      ok: missingFields.length === 0,
      missingFields,
      status: response.status,
    });
  }

  const ok = checks.every((item) => item.ok);
  return {
    name: 'schema-contract',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    checks,
  };
}

async function runAuthChecks(baseUrl) {
  if (!baseUrl) {
    return {
      name: 'auth-checks',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no local API server detected).',
      checks: [],
    };
  }

  if (!token && !authCookie) {
    return {
      name: 'auth-checks',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no auth token or cookie provided).',
      checks: [],
    };
  }

  const startedAt = Date.now();
  const checks = [];

  if (token) {
    for (const endpoint of authEndpoints) {
      const response = await httpRequest(`${baseUrl}${endpoint}`, 'GET', timeoutMs, authHeaders);
      checks.push({
        mode: 'bearer',
        endpoint,
        ok: response.ok,
        status: response.status,
      });
    }
  }

  if (authCookie) {
    const cookieHeaders = { ...authHeaders };
    delete cookieHeaders.Authorization;
    cookieHeaders.Cookie = authCookie;
    for (const endpoint of authEndpoints) {
      const response = await httpRequest(`${baseUrl}${endpoint}`, 'GET', timeoutMs, cookieHeaders);
      checks.push({
        mode: 'cookie',
        endpoint,
        ok: response.ok,
        status: response.status,
      });
    }
  }

  const ok = checks.every((item) => item.ok);
  return {
    name: 'auth-checks',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: Date.now() - startedAt,
    checks,
  };
}

function runRegressionGate(baselineSummary, currentSummary) {
  if (!baselineSummary) {
    return {
      name: 'regression-gate',
      ok: true,
      skipped: true,
      exitCode: 0,
      durationMs: 0,
      note: 'Skipped (no baseline summary found).',
    };
  }

  const baselinePerf = baselineSummary.checks?.find((check) => check.name === 'perf')?.metrics || null;
  const currentPerf = currentSummary.checks?.find((check) => check.name === 'perf')?.metrics || null;
  const baselineFailed = baselineSummary.totals?.failed || 0;
  const currentFailed = currentSummary.totals?.failed || 0;

  const p95Increase =
    baselinePerf && currentPerf && baselinePerf.p95 > 0
      ? (currentPerf.p95 - baselinePerf.p95) / baselinePerf.p95
      : 0;
  const errorRateIncrease =
    baselinePerf && currentPerf ? currentPerf.errorRate - baselinePerf.errorRate : 0;
  const failedIncrease = currentFailed - baselineFailed;

  const ok =
    p95Increase <= regressionThresholds.p95IncreasePct &&
    errorRateIncrease <= regressionThresholds.errorRateIncrease &&
    failedIncrease <= regressionThresholds.failIncrease;

  return {
    name: 'regression-gate',
    ok,
    exitCode: ok ? 0 : 1,
    durationMs: 0,
    metrics: {
      p95IncreasePct: p95Increase,
      errorRateIncrease,
      failedIncrease,
      thresholds: regressionThresholds,
    },
  };
}

function emitGitHubAnnotations(summary) {
  if (process.env.GITHUB_ACTIONS !== 'true') return;

  for (const check of summary.checks) {
    if (check.ok || check.skipped) continue;
    console.log(`::error title=API Diagnostics::${check.name} failed (exitCode=${check.exitCode || 1})`);
  }

  if (!summary.ok) {
    console.log(`::error title=API Diagnostics::exitReason=${summary.exitReason}`);
  }
}

function renderHtmlReport(summary) {
  const rows = summary.checks
    .map((check) => {
      const status = check.skipped ? 'skipped' : check.ok ? 'ok' : 'failed';
      const note = check.note ? `<div class="note">${check.note}</div>` : '';
      return `<tr class="${status}"><td>${check.name}</td><td>${status}</td><td>${check.durationMs || 0}</td><td>${note}</td></tr>`;
    })
    .join('');

  const coverageRows = Object.entries(summary.universeCoverage?.byUniverse || {})
    .map(([name, count]) => `<tr><td>${name}</td><td>${count}</td></tr>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>API Diagnostics Report</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; font-family: "Space Grotesk", "Sora", "Segoe UI", sans-serif; background: #f5f3ee; color: #1f2328; }
  header { padding: 32px 40px; background: radial-gradient(circle at top, #dfe9f3, #f5f3ee); }
  h1 { margin: 0 0 8px; font-size: 28px; }
  .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
  tr.ok td { color: #0f5d4d; }
  tr.failed td { color: #b42318; }
  tr.skipped td { color: #9b8b20; }
  .note { font-size: 12px; color: #6b7280; }
</style>
</head>
<body>
<header>
  <h1>API Diagnostics</h1>
  <div>Timestamp: ${summary.timestamp}</div>
</header>
<main style="padding: 24px 40px;">
  <section class="grid">
    <div class="card"><strong>Status</strong><div>${summary.ok ? 'PASS' : 'FAIL'}</div></div>
    <div class="card"><strong>Base URL</strong><div>${summary.baseUrl || 'not detected'}</div></div>
    <div class="card"><strong>Passed</strong><div>${summary.totals.passed}</div></div>
    <div class="card"><strong>Failed</strong><div>${summary.totals.failed}</div></div>
    <div class="card"><strong>Skipped</strong><div>${summary.totals.skipped}</div></div>
  </section>
  <section style="margin-top: 24px;" class="card">
    <h2 style="margin-top: 0;">Checks</h2>
    <table>
      <thead><tr><th>Check</th><th>Status</th><th>Duration (ms)</th><th>Notes</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>
  <section style="margin-top: 24px;" class="card">
    <h2 style="margin-top: 0;">Universe Coverage</h2>
    <table>
      <thead><tr><th>Universe</th><th>Endpoints</th></tr></thead>
      <tbody>${coverageRows || '<tr><td colspan="2">No data</td></tr>'}</tbody>
    </table>
  </section>
</main>
</body>
</html>`;
}

function buildExitReason(summary, strictFailed, thresholdFailed, regressionCheck) {
  if (strictFailed) return 'STRICT_SKIPPED';
  if (summary.checks?.some((check) => check.name === 'preflight-env' && !check.ok && !check.skipped)) return 'PREFLIGHT_FAIL';
  if (summary.checks?.some((check) => check.name === 'dependencies' && !check.ok && !check.skipped)) return 'DEPENDENCY_FAIL';
  if (summary.checks?.some((check) => check.name === 'route-slo' && !check.ok && !check.skipped)) return 'SLO_FAIL';
  if (summary.checks?.some((check) => check.name === 'flaky-score' && !check.ok && !check.skipped)) return 'FLAKY_FAIL';
  if (regressionCheck && !regressionCheck.ok && !regressionCheck.skipped) return 'REGRESSION_FAIL';
  if (thresholdFailed) return 'THRESHOLD_FAIL';
  if (summary.totals.failed > 0) return 'CHECK_FAIL';
  return 'OK';
}

function markdownSummary(summary, title = 'API Diagnostics Summary') {
  const lines = [];
  lines.push(`## ${title}`);
  lines.push('');
  lines.push(`- Status: **${summary.ok ? 'PASS' : 'FAIL'}**`);
  lines.push(`- Base URL: ${summary.baseUrl || 'not-detected'}`);
  lines.push(`- Passed: ${summary.totals.passed}`);
  lines.push(`- Failed: ${summary.totals.failed}`);
  lines.push(`- Skipped: ${summary.totals.skipped}`);
  lines.push(`- Exit Reason: ${summary.exitReason}`);
  lines.push('');
  lines.push('| Check | Status | Duration (ms) |');
  lines.push('|---|---:|---:|');
  for (const check of summary.checks) {
    const status = check.skipped ? 'skipped' : check.ok ? 'ok' : 'failed';
    lines.push(`| ${check.name} | ${status} | ${check.durationMs || 0} |`);
  }
  lines.push('');
  return lines.join('\n');
}

async function sendWebhook(summary) {
  if (!webhookUrl || summary.ok) return;

  try {
    const payload = JSON.stringify({
      text: `API diagnostics failed (${summary.exitReason})`,
      summary: {
        ok: summary.ok,
        exitReason: summary.exitReason,
        totals: summary.totals,
        baseUrl: summary.baseUrl,
      },
    });

    await new Promise((resolve) => {
      const parsed = new URL(webhookUrl);
      const transport = parsed.protocol === 'https:' ? https : http;
      const req = transport.request(
        {
          method: 'POST',
          hostname: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname + parsed.search,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 5000,
        },
        () => resolve()
      );
      req.on('error', () => resolve());
      req.on('timeout', () => {
        req.destroy();
        resolve();
      });
      req.write(payload);
      req.end();
    });
  } catch {}
}

function readLatestHistory() {
  const latestFile = path.join(historyDir, 'latest.json');
  if (!fs.existsSync(latestFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
  } catch {
    return null;
  }
}

function writeHistory(summary) {
  fs.mkdirSync(historyDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(historyDir, `api-diag-${ts}.json`);
  fs.writeFileSync(file, JSON.stringify(summary, null, 2), 'utf-8');
  fs.writeFileSync(path.join(historyDir, 'latest.json'), JSON.stringify(summary, null, 2), 'utf-8');
}

function buildDiff(previous, current) {
  if (!previous) return null;
  const prevPerf = previous.checks?.find((check) => check.name === 'perf')?.metrics || null;
  const curPerf = current.checks?.find((check) => check.name === 'perf')?.metrics || null;
  return {
    passedDelta: current.totals.passed - (previous.totals?.passed || 0),
    failedDelta: current.totals.failed - (previous.totals?.failed || 0),
    skippedDelta: current.totals.skipped - (previous.totals?.skipped || 0),
    p95Delta: curPerf && prevPerf ? curPerf.p95 - prevPerf.p95 : null,
    errorRateDelta: curPerf && prevPerf ? curPerf.errorRate - prevPerf.errorRate : null,
  };
}

async function runSingle(preferredBase = null, context = { attempt: 1 }) {
  const started = Date.now();
  let baseUrl = await resolveBaseUrl(preferredBase || explicitBase);
  baseUrl = await maybeAutoStartDevAndResolve(baseUrl);

  const preflightCheck = await runPreflightEnvCheck();
  const routesCheck = runRoutesCheck();
  const resolvedEndpoints = resolveEndpoints(routesCheck.discoveredApiRoutes || []);
  const dependencyCheck = await runDependencyChecks(baseUrl);
  const healthCheck = await runHealthBatch(baseUrl, resolvedEndpoints);
  const perfCheck = await runPerf(baseUrl, resolvedEndpoints);
  const routeSloCheck = await runRouteSloCheck(baseUrl, resolvedEndpoints);
  const flakyCheck = runFlakyCheck(healthCheck);
  const schemaSanityCheck = await runSchemaSanity(baseUrl);
  const schemaContractCheck = await runSchemaContract(baseUrl);
  const authCheck = await runAuthChecks(baseUrl);
  const openApiCheck = await runOpenApiConformance(routesCheck.discoveredApiRoutes || [], baseUrl);
  const coverage = buildUniverseCoverage(routesCheck.discoveredApiRoutes || []);

  let checks = [
    preflightCheck,
    routesCheck,
    dependencyCheck,
    healthCheck,
    perfCheck,
    routeSloCheck,
    flakyCheck,
    schemaSanityCheck,
    schemaContractCheck,
    authCheck,
    openApiCheck,
  ];

  let okCount = checks.filter((check) => check.ok).length;
  let skippedCount = checks.filter((check) => check.skipped).length;
  let strictFailed = strictMode && skippedCount > 0 && !allowSkip;
  let thresholdFailed = !!(perfCheck.metrics && perfCheck.metrics.severity === 'fail');

  let summary = {
    timestamp: new Date().toISOString(),
    attempt: context.attempt || 1,
    baseUrl,
    profile,
    strictMode,
    allowSkip,
    preset,
    endpointPreset,
    matrixPreset,
    summaryMode,
    jsonSummaryMode,
    retries,
    retryDelayMs,
    ports,
    endpoints: resolvedEndpoints,
    thresholds,
    universeCoverage: coverage,
    openApiSource: openApiCheck.source || null,
    checks,
    ok: okCount === checks.length && !strictFailed && !thresholdFailed,
    totals: {
      passed: okCount,
      failed: checks.length - okCount,
      skipped: skippedCount,
      durationMs: Date.now() - started,
    },
  };

  const baselineSummary = readJsonFileSafe(baselineFile);
  const regressionCheck = runRegressionGate(baselineSummary, summary);
  checks = [...checks, regressionCheck];
  okCount = checks.filter((check) => check.ok).length;
  skippedCount = checks.filter((check) => check.skipped).length;
  strictFailed = strictMode && skippedCount > 0 && !allowSkip;
  thresholdFailed = !!(perfCheck.metrics && perfCheck.metrics.severity === 'fail');

  summary = {
    ...summary,
    checks,
    ok: okCount === checks.length && !strictFailed && !thresholdFailed,
    totals: {
      passed: okCount,
      failed: checks.length - okCount,
      skipped: skippedCount,
      durationMs: Date.now() - started,
    },
  };

  summary.exitReason = buildExitReason(summary, strictFailed, thresholdFailed, regressionCheck);
  if (traceMode) {
    summary.trace = checks.map((check) => ({
      name: check.name,
      startedAt: check.startedAt || null,
      durationMs: check.durationMs || 0,
    }));
  }

  const previous = diffMode ? readLatestHistory() : null;
  if (diffMode) summary.diff = buildDiff(previous, summary);

  writeHistory(summary);

  if (writeBaseline) {
    writeFileSafe(baselineFile, JSON.stringify(summary, null, 2));
  }

  if (outFile) {
    const outPayload = jsonSummaryMode
      ? {
          timestamp: summary.timestamp,
          ok: summary.ok,
          baseUrl: summary.baseUrl,
          strictMode: summary.strictMode,
          allowSkip: summary.allowSkip,
          preset: summary.preset || null,
          endpointPreset: summary.endpointPreset || null,
          matrixPreset: summary.matrixPreset || null,
          profile: summary.profile,
          thresholds: summary.thresholds,
          preflightEnv: preflightEnv,
          dependencyTargets: dependencyTargets,
          rerunOnFail,
          openApiSource: summary.openApiSource || null,
          universeCoverage: summary.universeCoverage || null,
          trace: summary.trace || null,
          triage: summary.triage || null,
          rerun: summary.rerun || null,
          totals: summary.totals,
          checks: summary.checks.map((check) => ({
            name: check.name,
            ok: check.ok,
            skipped: !!check.skipped,
            exitCode: check.exitCode,
            durationMs: check.durationMs,
          })),
          exitReason: summary.exitReason,
          diff: summary.diff || null,
        }
      : summary;
    writeFileSafe(outFile, JSON.stringify(outPayload, null, 2));
  }

  const junitArg = getArgValue('--junit', hasFlag('--junit') ? path.join('artifacts', 'api-diagnostics.junit.xml') : null);
  if (junitArg) {
    writeFileSafe(junitArg, toJUnit(summary));
  }

  if (htmlOut) {
    writeFileSafe(htmlOut, renderHtmlReport(summary));
  }

  if (ghaSummaryPath) {
    writeFileSafe(ghaSummaryPath, markdownSummary(summary, 'API Diagnostics'));
  }

  await sendWebhook(summary);
  emitGitHubAnnotations(summary);
  return summary;
}

function printSummary(summary) {
  if (ndjsonMode) {
    for (const check of summary.checks) {
      console.log(
        JSON.stringify({
          type: 'check',
          name: check.name,
          ok: check.ok,
          skipped: !!check.skipped,
          durationMs: check.durationMs,
        })
      );
    }
    console.log(
      JSON.stringify({ type: 'summary', ok: summary.ok, totals: summary.totals, exitReason: summary.exitReason })
    );
    return;
  }

  if (asJson) {
    if (jsonSummaryMode) {
      const output = {
        timestamp: summary.timestamp,
        ok: summary.ok,
        baseUrl: summary.baseUrl,
        strictMode: summary.strictMode,
        allowSkip: summary.allowSkip,
        preset: summary.preset || null,
        endpointPreset: summary.endpointPreset || null,
        matrixPreset: summary.matrixPreset || null,
        profile: summary.profile,
        thresholds: summary.thresholds,
        preflightEnv: preflightEnv,
        dependencyTargets: dependencyTargets,
        rerunOnFail,
        openApiSource: summary.openApiSource || null,
        universeCoverage: summary.universeCoverage || null,
        trace: summary.trace || null,
        triage: summary.triage || null,
        rerun: summary.rerun || null,
        totals: summary.totals,
        checks: summary.checks.map((check) => ({
          name: check.name,
          ok: check.ok,
          skipped: !!check.skipped,
          exitCode: check.exitCode,
          durationMs: check.durationMs,
        })),
        exitReason: summary.exitReason,
        diff: summary.diff || null,
      };
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(JSON.stringify(summary, null, 2));
    }
    return;
  }

  if (summaryMode) {
    const status = summary.ok ? 'pass' : 'fail';
    console.log(
      `API_DIAG status=${status} passed=${summary.totals.passed} failed=${summary.totals.failed} skipped=${summary.totals.skipped} strict=${summary.strictMode} allowSkip=${summary.allowSkip} preset=${summary.preset || 'none'} endpoint-preset=${summary.endpointPreset || 'none'} base=${summary.baseUrl || 'none'} durationMs=${summary.totals.durationMs} exitReason=${summary.exitReason} triage=${summary.triage?.classification || 'none'}`
    );
    console.log(
      `API_DIAG_CHECKS ${summary.checks
        .map((check) => `${check.name}:${check.skipped ? 'skipped' : check.ok ? 'ok' : 'fail'}`)
        .join(' ')}`
    );
    if (traceMode && summary.trace) {
      console.log(
        `API_DIAG_TRACE ${summary.trace.map((t) => `${t.name}:${t.durationMs}ms`).join(' ')}`
      );
    }
    return;
  }

  console.log('\n============================================================');
  console.log('API DIAGNOSTICS');
  console.log('============================================================');
  console.log(`Base URL: ${summary.baseUrl || 'not detected'}`);
  console.log(`Profile: ${summary.profile}`);
  console.log(`Thresholds: p95 warn=${summary.thresholds.latencyWarnMs}ms fail=${summary.thresholds.latencyFailMs}ms | errorRate warn=${summary.thresholds.errorRateWarn} fail=${summary.thresholds.errorRateFail}`);
  for (const check of summary.checks) {
    if (check.skipped) {
      console.log(`• ${check.name} (skipped)`);
      console.log(`  ${check.note || ''}`);
      continue;
    }
    console.log(`${check.ok ? '✓' : '✗'} ${check.name} (${check.durationMs || 0}ms)`);
    if (check.metrics) {
      console.log(
        `  perf: p95=${Math.round(check.metrics.p95)}ms p99=${Math.round(check.metrics.p99)}ms errorRate=${check.metrics.errorRate.toFixed(3)} severity=${check.metrics.severity}`
      );
    }
    if (check.missingInSpec && check.missingInSpec.length) {
      console.log(`  missingInSpec: ${check.missingInSpec.join(', ')}`);
    }
  }
  if (summary.diff) {
    console.log('------------------------------------------------------------');
    console.log(
      `Diff vs last: passed ${summary.diff.passedDelta >= 0 ? '+' : ''}${summary.diff.passedDelta}, failed ${summary.diff.failedDelta >= 0 ? '+' : ''}${summary.diff.failedDelta}, skipped ${summary.diff.skippedDelta >= 0 ? '+' : ''}${summary.diff.skippedDelta}`
    );
  }
  console.log('------------------------------------------------------------');
  console.log(`Passed: ${summary.totals.passed}, Failed: ${summary.totals.failed}, Skipped: ${summary.totals.skipped}`);
  console.log(`Exit Reason: ${summary.exitReason}`);
  console.log(`Total duration: ${summary.totals.durationMs}ms`);
  console.log('============================================================\n');
}

async function runMatrix() {
  const started = Date.now();
  const runBases = matrixBases.length > 0 ? matrixBases : [explicitBase].filter(Boolean);
  const environmentSummaries = [];

  for (const base of runBases) {
    const summary = await runSingle(base);
    environmentSummaries.push({ base, summary });
  }

  const ok = environmentSummaries.every((item) => item.summary.ok);
  const aggregate = {
    timestamp: new Date().toISOString(),
    ok,
    mode: 'matrix',
    environments: environmentSummaries.map((item) => ({
      baseUrl: item.base,
      ok: item.summary.ok,
      totals: item.summary.totals,
      exitReason: item.summary.exitReason,
    })),
    durationMs: Date.now() - started,
  };

  if (asJson || jsonSummaryMode) {
    console.log(JSON.stringify(aggregate, null, 2));
  } else {
    console.log('\n============================================================');
    console.log('API DIAGNOSTICS MATRIX');
    console.log('============================================================');
    for (const env of aggregate.environments) {
      console.log(`${env.ok ? '✓' : '✗'} ${env.baseUrl} -> ${env.exitReason} (p:${env.totals.passed} f:${env.totals.failed} s:${env.totals.skipped})`);
    }
    console.log('============================================================\n');
  }

  process.exit(aggregate.ok ? 0 : 1);
}

async function main() {
  if (matrixBases.length > 0) {
    await runMatrix();
    return;
  }

  if (watchEverySec > 0) {
    while (true) {
      const summary = await runSingle(null, { attempt: 1 });
      printSummary(summary);
      await delay(watchEverySec * 1000);
    }
  }

  let summary = await runSingle(null, { attempt: 1 });
  if (rerunOnFail && !summary.ok) {
    const rerun = await runSingle(summary.baseUrl || null, { attempt: 2 });
    const triage = classifyRerunTriage(summary, rerun);
    if (rerun.ok) {
      summary = {
        ...rerun,
        triage,
        previousAttempt: {
          ok: summary.ok,
          exitReason: summary.exitReason,
          totals: summary.totals,
        },
      };
    } else {
      summary = {
        ...summary,
        triage,
        rerun: {
          ok: rerun.ok,
          exitReason: rerun.exitReason,
          totals: rerun.totals,
        },
      };
    }
  }

  printSummary(summary);
  process.exit(summary.ok ? 0 : 1);
}

main().catch((error) => {
  console.error('API diagnostics failed:', error.message);
  process.exit(1);
});
