#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);

function getArgValue(name, defaultValue = null) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return defaultValue;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const scheduleFile = getArgValue('--config', path.join('artifacts', 'diagnostics-schedule.json'));
const runOnce = hasFlag('--once');
const selectedProfile = (getArgValue('--profile', '') || '').trim().toLowerCase();

function parseCronToMinutes(cron) {
  if (!cron) return null;
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const minute = parts[0];
  if (minute.startsWith('*/')) {
    const step = Number(minute.slice(2));
    return Number.isFinite(step) && step > 0 ? step : null;
  }
  const exact = Number(minute);
  if (Number.isFinite(exact)) return 60;
  return null;
}

function loadSchedule() {
  if (!fs.existsSync(scheduleFile)) {
    console.error(`Schedule file not found: ${scheduleFile}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
  } catch (error) {
    console.error(`Unable to parse schedule file: ${error.message}`);
    process.exit(1);
  }
}

function runJob(job, options = {}) {
  const awaitCompletion = options.awaitCompletion === true;
  const command = job.command;
  const jobArgs = job.args || [];
  const webhookUrl = job.webhookUrl || process.env.SCHEDULE_WEBHOOK_URL || null;
  const startedAt = new Date().toISOString();
  const execute = () => {
    const child = spawn(command, jobArgs, {
      shell: true,
      stdio: 'inherit',
      env: process.env,
    });

    return new Promise((resolve) => {
      child.on('exit', (code) => {
    const exitCode = code ?? 1;
    console.log(`SCHEDULED job=${job.name} finished code=${exitCode} startedAt=${startedAt}`);

    try {
      const alertsPath = path.join('artifacts', 'diagnostics-alerts.json');
      const existing = fs.existsSync(alertsPath) ? JSON.parse(fs.readFileSync(alertsPath, 'utf-8')) : { jobs: {} };
      const updated = {
        ...existing,
        updatedAt: new Date().toISOString(),
        jobs: {
          ...existing.jobs,
          [job.name]: {
            name: job.name,
            command,
            args: jobArgs,
            lastRunAt: startedAt,
            exitCode,
            ok: exitCode === 0,
          },
        },
      };
      fs.mkdirSync(path.dirname(alertsPath), { recursive: true });
      fs.writeFileSync(alertsPath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (error) {
      console.error(`SCHEDULED job=${job.name} alert write failed: ${error.message}`);
    }

    if (webhookUrl && exitCode !== 0) {
      try {
        const payload = JSON.stringify({
          text: `Scheduled diagnostics job failed: ${job.name}`,
          job: {
            name: job.name,
            command,
            args: jobArgs,
            exitCode,
            startedAt,
          },
        });
        const parsed = new URL(webhookUrl);
        const transport = parsed.protocol === 'https:' ? require('https') : require('http');
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
          () => {}
        );
        req.on('error', () => {});
        req.on('timeout', () => req.destroy());
        req.write(payload);
        req.end();
      } catch (error) {
        console.error(`SCHEDULED job=${job.name} webhook failed: ${error.message}`);
      }
    }
      resolve(exitCode);
      });
    });
  };

  if (awaitCompletion) {
    return execute();
  }

  void execute();
  return null;
}

const schedule = loadSchedule();
const allJobs = schedule.jobs || [];
const jobs = allJobs.filter((job) => {
  if (!selectedProfile) return true;
  if (!Array.isArray(job.profiles) || job.profiles.length === 0) return true;
  return job.profiles.some((profile) => String(profile).toLowerCase() === selectedProfile);
});

if (selectedProfile) {
  console.log(`SCHEDULED profile=${selectedProfile} selectedJobs=${jobs.length}/${allJobs.length}`);
}

if (jobs.length === 0) {
  console.error(
    selectedProfile
      ? `No jobs configured for profile '${selectedProfile}' in schedule file.`
      : 'No jobs configured in schedule file.'
  );
  process.exit(1);
}

if (runOnce) {
  (async () => {
    let hasFailure = false;
    for (const job of jobs) {
      const exitCode = await runJob(job, { awaitCompletion: true });
      if (exitCode !== 0) {
        hasFailure = true;
      }
    }

    process.exit(hasFailure ? 1 : 0);
  })();
} else {
  for (const job of jobs) {
    const minutes = Number(job.everyMinutes) || parseCronToMinutes(job.cron);
    if (!minutes) {
      console.error(`Invalid schedule for job ${job.name}: specify everyMinutes or cron.`);
      continue;
    }
    const intervalMs = minutes * 60 * 1000;
    console.log(`SCHEDULED job=${job.name} every=${minutes}m command=${job.command}`);
    runJob(job);
    setInterval(() => runJob(job), intervalMs);
  }
}
