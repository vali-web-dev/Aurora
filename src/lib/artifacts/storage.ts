import { promises as fs } from 'fs';
import path from 'path';

type ArtifactStorageProvider = 'local' | 'azure-blob';

type CheckStatus = 'pass' | 'warn' | 'fail';

export interface ArtifactStorageConfigCheck {
  status: CheckStatus;
  message?: string;
  configuredProvider: string;
  activeProvider: ArtifactStorageProvider;
}

interface ResolvedStorageConfig {
  provider: ArtifactStorageProvider;
  localPath: string;
  azureBaseUrl: string;
  azureSasToken: string;
  check: ArtifactStorageConfigCheck;
}

interface ArtifactStorage {
  writeText(relativePath: string, content: string): Promise<void>;
  writeBuffer(relativePath: string, content: Uint8Array): Promise<void>;
  readText(relativePath: string): Promise<string>;
  readBuffer(relativePath: string): Promise<Uint8Array>;
  listDirectories(relativePath: string): Promise<string[]>;
}

class LocalArtifactStorage implements ArtifactStorage {
  constructor(private readonly rootPath: string) {}

  private toAbsolute(relativePath: string): string {
    return path.join(this.rootPath, relativePath);
  }

  private async ensureParent(relativePath: string): Promise<void> {
    await fs.mkdir(path.dirname(this.toAbsolute(relativePath)), { recursive: true });
  }

  async writeText(relativePath: string, content: string): Promise<void> {
    await this.ensureParent(relativePath);
    await fs.writeFile(this.toAbsolute(relativePath), content, 'utf8');
  }

  async writeBuffer(relativePath: string, content: Uint8Array): Promise<void> {
    await this.ensureParent(relativePath);
    await fs.writeFile(this.toAbsolute(relativePath), content);
  }

  async readText(relativePath: string): Promise<string> {
    return fs.readFile(this.toAbsolute(relativePath), 'utf8');
  }

  async readBuffer(relativePath: string): Promise<Uint8Array> {
    return new Uint8Array(await fs.readFile(this.toAbsolute(relativePath)));
  }

  async listDirectories(relativePath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.toAbsolute(relativePath), { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch {
      return [];
    }
  }
}

class AzureBlobArtifactStorage implements ArtifactStorage {
  private readonly baseUrl: string;
  private readonly sasToken: string;

  constructor(baseUrl: string, sasToken: string) {
    if (!baseUrl) {
      throw new Error('AZURE_BLOB_BASE_URL is required for azure-blob artifact storage');
    }
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.sasToken = sasToken || '';
  }

  private blobUrl(relativePath: string): string {
    const normalizedPath = relativePath
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');

    const sas = this.sasToken
      ? this.sasToken.startsWith('?')
        ? this.sasToken
        : `?${this.sasToken}`
      : '';

    return `${this.baseUrl}/${normalizedPath}${sas}`;
  }

  private containerListUrl(prefix: string): string {
    const queryParts: string[] = [];
    const rawSas = this.sasToken.startsWith('?')
      ? this.sasToken.slice(1)
      : this.sasToken;

    if (rawSas) {
      queryParts.push(rawSas);
    }

    queryParts.push('restype=container');
    queryParts.push('comp=list');
    queryParts.push('delimiter=%2F');

    const normalizedPrefix = prefix
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
      .join('/');
    if (normalizedPrefix) {
      queryParts.push(`prefix=${encodeURIComponent(`${normalizedPrefix}/`)}`);
    }

    return `${this.baseUrl}?${queryParts.join('&')}`;
  }

  private async assertOk(response: Response, action: string, relativePath: string): Promise<void> {
    if (response.ok) {
      return;
    }

    const body = await response.text().catch(() => '');
    throw new Error(`Azure Blob ${action} failed for ${relativePath}: ${response.status} ${body}`);
  }

  async writeText(relativePath: string, content: string): Promise<void> {
    const response = await fetch(this.blobUrl(relativePath), {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'content-type': 'text/plain; charset=utf-8',
      },
      body: content,
    });

    await this.assertOk(response, 'writeText', relativePath);
  }

  async writeBuffer(relativePath: string, content: Uint8Array): Promise<void> {
    const binary = new Uint8Array(content.length);
    binary.set(content);
    const uploadBody = binary.buffer.slice(
      binary.byteOffset,
      binary.byteOffset + binary.byteLength
    );

    const response = await fetch(this.blobUrl(relativePath), {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'content-type': 'application/octet-stream',
      },
      body: uploadBody,
    });

    await this.assertOk(response, 'writeBuffer', relativePath);
  }

  async readText(relativePath: string): Promise<string> {
    const response = await fetch(this.blobUrl(relativePath), { method: 'GET' });
    await this.assertOk(response, 'readText', relativePath);
    return response.text();
  }

  async readBuffer(relativePath: string): Promise<Uint8Array> {
    const response = await fetch(this.blobUrl(relativePath), { method: 'GET' });
    await this.assertOk(response, 'readBuffer', relativePath);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  async listDirectories(relativePath: string): Promise<string[]> {
    const response = await fetch(this.containerListUrl(relativePath), { method: 'GET' });
    await this.assertOk(response, 'listDirectories', relativePath);

    const xml = await response.text();
    const matches = [...xml.matchAll(/<BlobPrefix>\s*<Name>([^<]+)<\/Name>\s*<\/BlobPrefix>/g)];
    const basePrefix = relativePath
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
      .join('/');
    const stripPrefix = basePrefix ? `${basePrefix}/` : '';

    return matches
      .map((match) => match[1] || '')
      .map((name) => name.trim().replace(/^\/+|\/+$/g, ''))
      .map((name) => (stripPrefix && name.startsWith(stripPrefix) ? name.slice(stripPrefix.length) : name))
      .map((name) => name.replace(/^\/+|\/+$/g, ''))
      .filter(Boolean);
  }
}

let cachedStorage: ArtifactStorage | null = null;
let cachedConfig: ResolvedStorageConfig | null = null;

function normalizeProvider(value: string | undefined): string {
  return (value || 'local').trim().toLowerCase();
}

function resolveStorageConfig(): ResolvedStorageConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configuredProvider = normalizeProvider(process.env.ARTIFACT_STORAGE_PROVIDER);
  const localPath = process.env.ARTIFACT_STORAGE_LOCAL_PATH || '.';
  const azureBaseUrl = process.env.AZURE_BLOB_BASE_URL || '';
  const azureSasToken = process.env.AZURE_BLOB_SAS_TOKEN || '';
  const isProd = process.env.NODE_ENV === 'production';

  if (configuredProvider === 'azure-blob') {
    const missing: string[] = [];
    if (!azureBaseUrl) {
      missing.push('AZURE_BLOB_BASE_URL');
    }
    if (!azureSasToken) {
      missing.push('AZURE_BLOB_SAS_TOKEN');
    }

    if (missing.length === 0) {
      cachedConfig = {
        provider: 'azure-blob',
        localPath,
        azureBaseUrl,
        azureSasToken,
        check: {
          status: 'pass',
          configuredProvider,
          activeProvider: 'azure-blob',
        },
      };
      return cachedConfig;
    }

    cachedConfig = {
      provider: 'local',
      localPath,
      azureBaseUrl,
      azureSasToken,
      check: {
        status: isProd ? 'fail' : 'warn',
        configuredProvider,
        activeProvider: 'local',
        message: `Artifact storage configured for azure-blob but missing: ${missing.join(', ')}. Falling back to local storage at ${localPath}.`,
      },
    };
    return cachedConfig;
  }

  if (configuredProvider !== 'local') {
    cachedConfig = {
      provider: 'local',
      localPath,
      azureBaseUrl,
      azureSasToken,
      check: {
        status: 'warn',
        configuredProvider,
        activeProvider: 'local',
        message: `Unknown ARTIFACT_STORAGE_PROVIDER value '${configuredProvider}'. Falling back to local storage at ${localPath}.`,
      },
    };
    return cachedConfig;
  }

  cachedConfig = {
    provider: 'local',
    localPath,
    azureBaseUrl,
    azureSasToken,
    check: {
      status: 'pass',
      configuredProvider,
      activeProvider: 'local',
    },
  };
  return cachedConfig;
}

export function getArtifactStorageConfigCheck(): ArtifactStorageConfigCheck {
  return resolveStorageConfig().check;
}

export function getArtifactStorage(): ArtifactStorage {
  if (cachedStorage) {
    return cachedStorage;
  }

  const resolved = resolveStorageConfig();
  if (resolved.check.message) {
    if (resolved.check.status === 'fail') {
      console.error(resolved.check.message);
    } else if (resolved.check.status === 'warn') {
      console.warn(resolved.check.message);
    }
  }

  if (resolved.provider === 'azure-blob') {
    cachedStorage = new AzureBlobArtifactStorage(
      resolved.azureBaseUrl,
      resolved.azureSasToken
    );
    return cachedStorage;
  }

  cachedStorage = new LocalArtifactStorage(resolved.localPath);
  return cachedStorage;
}

export function __resetArtifactStorageForTests(): void {
  cachedStorage = null;
  cachedConfig = null;
}
