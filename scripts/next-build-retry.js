const { spawnSync } = require('child_process');
const fs = require('fs');

const ATTEMPTS = 2;
const CLEAN_DIRS = ['.next', '.next-dev', '.next-build'];

function clean() {
  for (const dir of CLEAN_DIRS) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (_) {
      // ignore cleanup failures
    }
  }
}

function runBuild(attempt) {
  console.log(`\n[next-build-retry] attempt ${attempt}/${ATTEMPTS}`);
  const result = spawnSync('next', ['build'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  return typeof result.status === 'number' ? result.status : 1;
}

let exitCode = 1;
for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  if (attempt > 1) {
    clean();
  }

  exitCode = runBuild(attempt);
  if (exitCode === 0) {
    process.exit(0);
  }
}

console.error('[next-build-retry] build failed after retries');
process.exit(exitCode);
