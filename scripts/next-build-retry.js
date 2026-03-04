const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ATTEMPTS = 2;
const DIST_DIR = process.env.NEXT_DIST_DIR || '.next-build';
const CLEAN_DIRS = [DIST_DIR];
const DEEP_CLEAN_DIRS = [DIST_DIR, '.swc', 'node_modules/.cache/webpack'];
const BUILD_LOCK_FILE = path.join(process.cwd(), `${DIST_DIR}.lock`);
const MAX_LOCK_AGE_MS = 2 * 60 * 60 * 1000;
const LOCK_WAIT_TIMEOUT_MS = 90 * 1000;
const LOCK_POLL_MS = 500;
const JSON_LOGS_ENABLED = process.env.NEXT_BUILD_JSON_LOGS === '1';

function formatDuration(ms) {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

function logEvent(event, payload = {}) {
  if (!JSON_LOGS_ENABLED) return;

  const record = {
    source: 'next-build-retry',
    event,
    pid: process.pid,
    ts: new Date().toISOString(),
    ...payload,
  };

  process.stdout.write(`${JSON.stringify(record)}\n`);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeDirWithRetries(dir, retries = 5) {
  for (let index = 0; index < retries; index += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
      return;
    } catch (error) {
      if (index === retries - 1) {
        try {
          const safeName = dir.replace(/[\\/]/g, '-');
          const tempTarget = path.join(process.cwd(), `${safeName}-stale-${Date.now()}`);
          fs.renameSync(dir, tempTarget);
          fs.rmSync(tempTarget, { recursive: true, force: true });
        } catch (_) {
          // ignore final fallback failure
        }
        return;
      }
      sleep(150 * (index + 1));
    }
  }
}

function clean(mode = 'normal') {
  const dirs = mode === 'deep' ? DEEP_CLEAN_DIRS : CLEAN_DIRS;
  for (const dir of dirs) {
    removeDirWithRetries(dir);
  }
}

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error && (error.code === 'ESRCH' || error.code === 'EPERM')) {
      return false;
    }
    return false;
  }
}

function isStaleLock() {
  try {
    const raw = fs.readFileSync(BUILD_LOCK_FILE, 'utf8');
    const [pidLine, tsLine] = raw.split(/\r?\n/);
    const lockPid = Number.parseInt(pidLine, 10);
    const lockTs = Date.parse(tsLine || '');

    if (!isProcessRunning(lockPid)) {
      return true;
    }

    if (Number.isFinite(lockTs) && Date.now() - lockTs > MAX_LOCK_AGE_MS) {
      return true;
    }

    return false;
  } catch (_) {
    return true;
  }
}

function acquireBuildLock() {
  const waitStart = Date.now();
  let hasWaited = false;

  while (Date.now() - waitStart <= LOCK_WAIT_TIMEOUT_MS) {
    try {
      const fd = fs.openSync(BUILD_LOCK_FILE, 'wx');
      fs.writeFileSync(fd, `${process.pid}\n${new Date().toISOString()}\n`, { encoding: 'utf8' });
      fs.closeSync(fd);
      logEvent('lock_acquired', {
        lockFile: BUILD_LOCK_FILE,
        waitedMs: Date.now() - waitStart,
      });
      return true;
    } catch (error) {
      if (!error || error.code !== 'EEXIST') {
        throw error;
      }

      if (!hasWaited) {
        hasWaited = true;
        logEvent('lock_wait_started', {
          lockFile: BUILD_LOCK_FILE,
          timeoutMs: LOCK_WAIT_TIMEOUT_MS,
        });
      }

      if (isStaleLock()) {
        try {
          fs.rmSync(BUILD_LOCK_FILE, { force: true });
          logEvent('lock_stale_removed', { lockFile: BUILD_LOCK_FILE });
          continue;
        } catch (_) {
          // continue to wait/retry path below
        }
      }

      sleep(LOCK_POLL_MS);
    }
  }

  console.error(`[next-build-retry] another build is already running (lock: ${BUILD_LOCK_FILE})`);
  logEvent('lock_acquire_timeout', {
    lockFile: BUILD_LOCK_FILE,
    timeoutMs: LOCK_WAIT_TIMEOUT_MS,
  });
  return false;
}

function releaseBuildLock() {
  try {
    fs.rmSync(BUILD_LOCK_FILE, { force: true });
    logEvent('lock_released', { lockFile: BUILD_LOCK_FILE });
  } catch (_) {
    // ignore lock cleanup failure
  }
}

function runBuild(attempt) {
  const start = Date.now();
  console.log(`\n[next-build-retry] attempt ${attempt}/${ATTEMPTS} started`);
  logEvent('attempt_started', { attempt, attemptsTotal: ATTEMPTS });
  const result = spawnSync('next', ['build'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  const exitCode = typeof result.status === 'number' ? result.status : 1;
  const elapsed = Date.now() - start;
  console.log(`[next-build-retry] attempt ${attempt}/${ATTEMPTS} finished with code ${exitCode} in ${formatDuration(elapsed)}`);
  logEvent('attempt_finished', {
    attempt,
    attemptsTotal: ATTEMPTS,
    exitCode,
    elapsedMs: elapsed,
  });
  return exitCode;
}

if (!acquireBuildLock()) {
  process.exit(1);
}

let exitCode = 1;
const totalStart = Date.now();
try {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    if (attempt > 1) {
      console.log('[next-build-retry] retry cleanup: deep cache cleanup before next attempt');
      logEvent('retry_cleanup_started', { mode: 'deep', attempt });
      sleep(300);
      clean('deep');
      logEvent('retry_cleanup_finished', { mode: 'deep', attempt });
    }

    exitCode = runBuild(attempt);
    if (exitCode === 0) {
      const elapsedTotal = Date.now() - totalStart;
      console.log(`[next-build-retry] build succeeded in ${formatDuration(elapsedTotal)}`);
      logEvent('build_succeeded', { elapsedMs: elapsedTotal, attemptsUsed: attempt });
      process.exit(0);
    }
  }
} finally {
  releaseBuildLock();
}

const elapsedTotal = Date.now() - totalStart;
console.error(`[next-build-retry] build failed after retries in ${formatDuration(elapsedTotal)}`);
logEvent('build_failed', { elapsedMs: elapsedTotal, attemptsUsed: ATTEMPTS, exitCode });
process.exit(exitCode);
