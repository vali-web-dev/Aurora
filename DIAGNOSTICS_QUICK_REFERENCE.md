# 20 Diagnostics Upgrades - Quick Reference

## Tier 1: Essential Commands (Start Here)

```bash
npm run api:diagnose           # Full diagnostics (JSON verbose)
npm run api:diagnose:summary   # Compact CI log (one line)
npm run platform:diagnose      # Platform health aggregator
```

## Tier 2: Reporting & Artifacts

```bash
npm run api:diagnose:html      # Generate HTML report artifact
npm run api:diagnose:junit     # Generate JUnit XML for CI systems
npm run api:diagnose:artifact  # Generate JSON summary artifact
npm run diagnostics:report     # All HTML reports at once
```

## Tier 3: Fast Checks & Gates

```bash
npm run api:diagnose:smoke              # <200ms pre-commit check
npm run api:diagnose:baseline:write     # Save reference for regressions
npm run api:diagnose:regression         # Compare vs baseline, report deltas
npm run api:diagnose:trace              # Show per-check timings
npm run platform:diagnose:trace         # Platform timing breakdown
```

## Tier 4: Advanced Validation

```bash
npm run api:diagnose:auth               # Bearer token + cookie auth testing
npm run api:diagnose:openapi:auto       # Auto-detect OpenAPI spec
npm run api:diagnose -- --schema-contract artifacts/schema.json  # Field coverage
npm run api:ci:diagnose:matrix          # Multi-environment tests
```

## Tier 5: CI/CD Integration

```bash
npm run diagnostics:ci                  # Full CI pipeline run
npm run api:diagnose:ndjson             # Structured logs (ELK/Datadog)
npm run platform:diagnose:webhook       # Send Slack alerts on failure
npm run platform:diagnose:auto-start    # Auto-start dev server
```

## Flag Quick Reference

| Flag | Use Case | Example |
|------|----------|---------|
| `--summary` | One-line CI output | `npm run api:diagnose -- --summary` |
| `--json-summary` | Compact JSON artifact | `npm run api:diagnose -- --json-summary` |
| `--html-out FILE` | HTML report | `npm run api:diagnose -- --html-out artifacts/report.html` |
| `--trace` | Per-check timings | `npm run api:diagnose -- --summary --trace` |
| `--ndjson` | Streaming JSON | `npm run api:diagnose -- --ndjson` |
| `--smoke` | Fast pre-commit | `npm run api:diagnose -- --smoke` |
| `--strict` | Fail on skipped checks | `npm run api:diagnose -- --strict` |
| `--profile PROFILE` | Threshold preset | `npm run api:diagnose -- --profile strict` |
| `--diff` | Compare vs baseline | `npm run api:diagnose -- --diff` |
| `--baseline FILE` | Regression baseline | `npm run api:diagnose -- --baseline artifacts/baseline.json` |
| `--write-baseline` | Save baseline | `npm run api:diagnose -- --write-baseline` |
| `--auth-endpoints` | Auth check targets | `npm run api:diagnose -- --auth-endpoints /api/users/profile` |
| `--auth-token-env VAR` | Auth token source | `npm run api:diagnose -- --auth-token-env API_TOKEN` |
| `--auth-cookie VAR` | Session cookie | `npm run api:diagnose -- --auth-cookie "session=xyz"` |
| `--openapi FILE` | OpenAPI spec path | `npm run api:diagnose -- --openapi docs/openapi.json` |
| `--openapi-auto` | Auto-detect spec | `npm run api:diagnose -- --openapi-auto` |
| `--endpoint-preset NAME` | Universe filter | `npm run api:diagnose -- --endpoint-preset commerce` |
| `--matrix URLS` | Multi-base test | `npm run api:diagnose -- --matrix localhost:3000,localhost:3001` |
| `--matrix-preset ENV` | Preset matrices | `npm run api:diagnose -- --matrix-preset dev` |
| `--webhook-url URL` | Alert endpoint | `npm run api:diagnose -- --webhook-url https://hooks.slack.com/...` |
| `--auto-start-dev` | Launch dev server | `npm run platform:diagnose -- --auto-start-dev` |
| `--allow-db-skip` | Skip DB on offline | `npm run platform:diagnose -- --allow-db-skip` |

## Output Formats

### Summary (CI Logs)
```
API_DIAG status=pass passed=8 failed=0 skipped=0 base=http://localhost:3000 durationMs=3500 exitReason=OK
API_DIAG_CHECKS routes:ok health-batch:ok perf:ok schema-sanity:ok schema-contract:ok auth-checks:ok openapi-conformance:ok regression-gate:ok
API_DIAG_TRACE routes:200ms health-batch:500ms perf:1200ms schema-sanity:300ms schema-contract:500ms auth-checks:700ms openapi-conformance:100ms regression-gate:0ms
```

### JSON Summary (Artifacts)
```json
{
  "timestamp": "2026-02-22T16:29:35.808Z",
  "ok": true,
  "profile": "balanced",
  "preset": null,
  "endpointPreset": null,
  "openApiSource": null,
  "universeCoverage": {"total": 35, "byUniverse": {"Commerce": 5, ...}},
  "totals": {"passed": 8, "failed": 0, "skipped": 0, "durationMs": 3500},
  "exitReason": "OK",
  "diff": {"passedDelta": 0, "failedDelta": 0, ...}
}
```

### NDJSON (Log Streaming)
```
{"type":"check","name":"routes","ok":true,"skipped":false,"durationMs":200}
{"type":"check","name":"health-batch","ok":true,"skipped":false,"durationMs":500}
...
{"type":"summary","ok":true,"totals":{"passed":8,"failed":0,"skipped":0},"exitReason":"OK"}
```

## Dashboard

Visit: **http://localhost:3000/dev/diagnostics**

Features:
- Real-time status cards (API + Platform)
- Universe coverage breakdown
- Baseline diff tracking
- Auto-refresh toggle (5s interval)
- Latest run timestamp
- Direct command reference

## Exit Codes & Reasons

| Exit Code | Exit Reason | Meaning |
|-----------|-------------|---------|
| 0 | OK | All checks passed |
| 1 | CHECK_FAIL | One or more checks failed |
| 1 | THRESHOLD_FAIL | Performance/error rate exceeded limits |
| 1 | STRICT_SKIPPED | Strict mode + skipped checks |
| 1 | REGRESSION_FAIL | Baseline regression detected |

## Common Workflows

### Pre-commit Hook
```bash
#!/bin/bash
npm run api:diagnose:smoke
if [ $? -ne 0 ]; then
  echo "❌ API health check failed"
  exit 1
fi
```

### CI Pipeline
```yaml
- name: Run Diagnostics
  run: npm run diagnostics:ci

- name: Upload Reports
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: diagnostics-reports
    path: artifacts/*.html
```

### Baseline Regression Testing
```bash
# Initial setup
npm run api:diagnose:baseline:write

# In CI: check for regressions
npm run api:diagnose:regression
if [ $? -ne 0 ]; then
  echo "⚠️  Performance regression detected"
  exit 1
fi
```

### Multi-Environment Testing
```bash
AURORA_STAGE_URL=https://stage.example.com \
AURORA_PROD_URL=https://api.example.com \
npm run api:ci:diagnose:matrix
```

## Tips & Tricks

- **Combine flags**: `npm run api:diagnose -- --summary --trace --html-out reports/latest.html`
- **Env var shortcuts**: Set `API_DIAG_WEBHOOK_URL` and use `--webhook-url` bareword
- **Profile shortcuts**: `--profile strict` auto-tunes all thresholds
- **Endpoint filtering**: Use `--endpoint-preset brand` instead of manually listing all routes
- **Auth all at once**: `--auth-endpoints /api/users/profile,/api/users/activity` tests multiple
- **Write baseline on clean build**: `npm run build && npm run api:diagnose:baseline:write`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No API server detected" | Run `npm run dev` first, or use `--auto-start-dev` |
| "DB check skipped" | Use `--allow-db-skip` flag (expected in offline env) |
| "OpenAPI not found" | Ensure `/api/docs/openapi.json` exists or use `--openapi-auto` |
| "Auth checks failed" | Verify auth token in `API_TOKEN` env, or pass `--auth-token-env` |
| "Webhook timeout" | Increase timeout via webhook service, or increase `--timeout-ms` |
| "HTML incomplete" | Check file permissions on artifacts/ directory |
