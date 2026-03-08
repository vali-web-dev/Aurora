const { spawn } = require('node:child_process');

const RESTART_LIMIT = Number(process.env.DEV_WATCH_RESTART_LIMIT || 3);
let restartCount = 0;

function start() {
  const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';
  const child = spawn(nodeCmd, ['scripts/next-dev-recover.js', '--custom-server', '--force-restart'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code === 0) {
      process.exit(0);
      return;
    }

    restartCount += 1;
    if (restartCount > RESTART_LIMIT) {
      console.error(`[dev:watch] Exceeded restart limit (${RESTART_LIMIT}).`);
      process.exit(code || 1);
      return;
    }

    console.warn(`[dev:watch] Dev process exited with code ${code}. Restarting (${restartCount}/${RESTART_LIMIT})...`);
    setTimeout(start, 1500);
  });
}

start();
