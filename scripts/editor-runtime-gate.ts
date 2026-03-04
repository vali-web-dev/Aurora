import fs from 'fs/promises';
import path from 'path';

type GateStatus = 'pass' | 'warn' | 'fail';

interface GatePayload {
  generatedAt: string;
  profile: string;
  status: GateStatus;
  alerts?: Array<{ id: string; severity: 'warning' | 'critical'; message: string }>;
}

function parseFileArg(): string {
  const direct = process.argv.find((arg) => arg.startsWith('--file='));
  const flagIndex = process.argv.findIndex((arg) => arg === '--file');
  return (direct ? direct.split('=')[1] : flagIndex >= 0 ? process.argv[flagIndex + 1] : 'artifacts/editor-runtime-ci-export.json') ?? 'artifacts/editor-runtime-ci-export.json';
}

function parseFailOnWarn(): boolean {
  return process.argv.includes('--fail-on-warn');
}

async function run() {
  const fileArg = parseFileArg();
  const filePath = path.resolve(process.cwd(), fileArg);
  const failOnWarn = parseFailOnWarn();

  const content = await fs.readFile(filePath, 'utf-8');
  const payload = JSON.parse(content) as GatePayload;

  const shouldFail = payload.status === 'fail' || (failOnWarn && payload.status === 'warn');

  console.log(`Editor runtime gate: status=${payload.status} profile=${payload.profile} generatedAt=${payload.generatedAt}`);
  if (Array.isArray(payload.alerts) && payload.alerts.length > 0) {
    for (const alert of payload.alerts.slice(0, 8)) {
      console.log(`- [${alert.severity}] ${alert.message}`);
    }
  }

  if (shouldFail) {
    console.error('Editor runtime gate failed.');
    process.exit(1);
  }

  console.log('Editor runtime gate passed.');
}

run().catch((error) => {
  console.error('Editor runtime gate errored:', error);
  process.exit(1);
});
