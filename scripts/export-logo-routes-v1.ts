import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), 'docs', 'brand', 'logo-drafts', 'routes-v1');
const outputDir = path.join(inputDir, 'png');
const sizes = [64, 128, 256, 512];
type RouteId = 'a' | 'b' | 'c';

function parseSizesArg(): number[] | null {
  const args = process.argv.slice(2);
  const sizeValues: string[] = [];

  const direct = args.find((arg) => arg.startsWith('--size='));
  if (direct) {
    sizeValues.push(...(direct.split('=')[1] || '').split(','));
  }

  const flagIndex = args.findIndex((arg) => arg === '--size');
  if (flagIndex >= 0) {
    const raw = args[flagIndex + 1];
    if (raw) {
      sizeValues.push(...raw.split(','));
    }
  }

  const normalized = sizeValues
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  if (normalized.length === 0) {
    return null;
  }

  const allowed = new Set(sizes);
  const unique = Array.from(new Set(normalized));
  const invalid = unique.filter((value) => !allowed.has(value));

  if (invalid.length > 0) {
    throw new Error(
      `Invalid size value(s): ${invalid.join(', ')}. Allowed sizes: ${sizes.join(', ')}.`
    );
  }

  return unique;
}

function parseRouteArg(): RouteId | null {
  const args = process.argv.slice(2);
  const direct = args.find((arg) => arg.startsWith('--route='));
  if (direct) {
    const value = direct.split('=')[1]?.toLowerCase();
    return value === 'a' || value === 'b' || value === 'c' ? value : null;
  }

  const flagIndex = args.findIndex((arg) => arg === '--route');
  if (flagIndex >= 0) {
    const value = args[flagIndex + 1]?.toLowerCase();
    return value === 'a' || value === 'b' || value === 'c' ? value : null;
  }

  return null;
}

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function listSvgFiles() {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
    .map((entry) => entry.name);
}

async function exportPngs() {
  const allSvgFiles = await listSvgFiles();
  const route = parseRouteArg();
  const selectedSizes = parseSizesArg() || sizes;
  const svgFiles = route
    ? allSvgFiles.filter((name) => name.startsWith(`aurora-route-${route}-`))
    : allSvgFiles;

  if (svgFiles.length === 0) {
    if (route) {
      throw new Error(`No SVG files found for route '${route}' in logo-drafts/routes-v1.`);
    }
    throw new Error('No SVG files found in logo-drafts/routes-v1.');
  }

  await ensureDir(outputDir);

  for (const size of selectedSizes) {
    const sizeDir = path.join(outputDir, String(size));
    await ensureDir(sizeDir);

    for (const svgFile of svgFiles) {
      const inputPath = path.join(inputDir, svgFile);
      const outputName = svgFile.replace(/\.svg$/i, '.png');
      const outputPath = path.join(sizeDir, outputName);

      const svgBuffer = await fs.readFile(inputPath);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
    }
  }

  console.log(
    `Route logo PNG exports complete${route ? ` (route ${route.toUpperCase()})` : ''}. Exported ${svgFiles.length} SVGs across ${selectedSizes.length} sizes (${selectedSizes.join(', ')}).`
  );
}

exportPngs().catch((error) => {
  console.error('Route logo PNG export failed:', error);
  process.exit(1);
});
