#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import {
  __resetArtifactStorageForTests,
  getArtifactStorage,
} from '../src/lib/artifacts/storage';

const ROOT = process.cwd();
const DEFAULT_OUT_FILE = path.join(ROOT, 'artifacts', 'artifact-storage-smoke.json');

interface SmokeCheck {
  name: 'local' | 'azure-mock';
  status: 'pass' | 'fail';
  durationMs: number;
  details?: Record<string, unknown>;
  error?: string;
}

function getArgValue(name: string): string | null {
  const args = process.argv.slice(2);
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) {
    return direct.slice(name.length + 1);
  }

  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }

  return null;
}

async function writeReport(report: Record<string, unknown>, outFile: string): Promise<void> {
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(report, null, 2), 'utf8');
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function runLocalSmoke(): Promise<SmokeCheck> {
  const started = Date.now();
  const localRoot = path.join(ROOT, '.artifacts-smoke');
  try {
    await fs.rm(localRoot, { recursive: true, force: true });

    process.env.ARTIFACT_STORAGE_PROVIDER = 'local';
    process.env.ARTIFACT_STORAGE_LOCAL_PATH = localRoot;
    delete process.env.AZURE_BLOB_BASE_URL;
    delete process.env.AZURE_BLOB_SAS_TOKEN;

    __resetArtifactStorageForTests();
    const storage = getArtifactStorage();

    await storage.writeText('invoices/inv_local_1/invoice.json', '{"id":"inv_local_1"}');
    await storage.writeText('invoices/inv_local_2/invoice.json', '{"id":"inv_local_2"}');

    const dirs = (await storage.listDirectories('invoices')).sort();
    assert(dirs.length === 2, `Local smoke expected 2 directories, received ${dirs.length}`);
    assert(dirs.includes('inv_local_1'), 'Local smoke missing inv_local_1');
    assert(dirs.includes('inv_local_2'), 'Local smoke missing inv_local_2');

    return {
      name: 'local',
      status: 'pass',
      durationMs: Date.now() - started,
      details: { directories: dirs },
    };
  } catch (error) {
    return {
      name: 'local',
      status: 'fail',
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await fs.rm(localRoot, { recursive: true, force: true });
  }
}

function createAzureMockFetch(baseUrl: string): typeof fetch {
  const blobMap = new Map<string, Uint8Array>();

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url);

    const isList = url.searchParams.get('comp') === 'list' && url.searchParams.get('restype') === 'container';
    if (isList) {
      const prefix = (url.searchParams.get('prefix') || '').replace(/\/$/, '');
      const uniquePrefixes = new Set<string>();

      for (const key of blobMap.keys()) {
        if (!prefix || key.startsWith(`${prefix}/`)) {
          const tail = prefix ? key.slice(prefix.length + 1) : key;
          const firstSegment = tail.split('/')[0];
          if (firstSegment) {
            uniquePrefixes.add(prefix ? `${prefix}/${firstSegment}/` : `${firstSegment}/`);
          }
        }
      }

      const xml = `<?xml version=\"1.0\" encoding=\"utf-8\"?><EnumerationResults><Blobs>${[...uniquePrefixes]
        .map((item) => `<BlobPrefix><Name>${item}</Name></BlobPrefix>`)
        .join('')}</Blobs></EnumerationResults>`;

      return new Response(xml, { status: 200, headers: { 'content-type': 'application/xml' } });
    }

    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const raw = url.toString();
    const pathWithQuery = raw.startsWith(normalizedBase) ? raw.slice(normalizedBase.length) : '';
    const blobPath = decodeURIComponent(pathWithQuery.split('?')[0] || '').replace(/^\/+/, '');

    if (!blobPath) {
      return new Response('Not Found', { status: 404 });
    }

    if (method === 'PUT') {
      const body = init?.body;
      let payload = new Uint8Array();
      if (typeof body === 'string') {
        payload = new TextEncoder().encode(body);
      } else if (body instanceof ArrayBuffer) {
        payload = new Uint8Array(body);
      } else if (body instanceof Uint8Array) {
        payload = new Uint8Array(body);
      } else if (body && typeof body === 'object' && 'arrayBuffer' in body && typeof (body as any).arrayBuffer === 'function') {
        const ab = await (body as any).arrayBuffer();
        payload = new Uint8Array(ab);
      }

      blobMap.set(blobPath, payload);
      return new Response('', { status: 201 });
    }

    if (method === 'GET') {
      const payload = blobMap.get(blobPath);
      if (!payload) {
        return new Response('Not Found', { status: 404 });
      }
      const body = new TextDecoder().decode(payload);
      return new Response(body, { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  };
}

async function runAzureSmoke(): Promise<SmokeCheck> {
  const started = Date.now();
  const originalFetch = globalThis.fetch;

  process.env.ARTIFACT_STORAGE_PROVIDER = 'azure-blob';
  process.env.AZURE_BLOB_BASE_URL = 'https://example.blob.core.windows.net/test-container';
  process.env.AZURE_BLOB_SAS_TOKEN = '?sv=mock';

  globalThis.fetch = createAzureMockFetch(process.env.AZURE_BLOB_BASE_URL);

  try {
    __resetArtifactStorageForTests();
    const storage = getArtifactStorage();

    await storage.writeText('invoices/inv_cloud_1/invoice.json', '{"id":"inv_cloud_1"}');
    await storage.writeText('invoices/inv_cloud_2/invoice.json', '{"id":"inv_cloud_2"}');

    const dirs = (await storage.listDirectories('invoices')).sort();
    assert(dirs.length === 2, `Azure smoke expected 2 directories, received ${dirs.length}`);
    assert(dirs.includes('inv_cloud_1'), 'Azure smoke missing inv_cloud_1');
    assert(dirs.includes('inv_cloud_2'), 'Azure smoke missing inv_cloud_2');

    return {
      name: 'azure-mock',
      status: 'pass',
      durationMs: Date.now() - started,
      details: { directories: dirs },
    };
  } catch (error) {
    return {
      name: 'azure-mock',
      status: 'fail',
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function main() {
  const outFile = getArgValue('--out') || DEFAULT_OUT_FILE;
  const local = await runLocalSmoke();
  const azure = await runAzureSmoke();
  const checks = [local, azure];
  const failed = checks.filter((check) => check.status === 'fail');

  const report = {
    timestamp: new Date().toISOString(),
    status: failed.length > 0 ? 'fail' : 'pass',
    checks,
  };

  await writeReport(report, outFile);
  console.log('ARTIFACT_STORAGE_SMOKE_REPORT');
  console.log(JSON.stringify(report, null, 2));

  if (failed.length > 0) {
    console.error('ARTIFACT_STORAGE_SMOKE:FAIL');
    process.exit(1);
  }

  console.log('ARTIFACT_STORAGE_SMOKE:PASS');
}

main().catch((error) => {
  console.error('ARTIFACT_STORAGE_SMOKE:FAIL');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
