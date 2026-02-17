import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), 'docs', 'brand', 'sub-universe-logos');
const outputDir = path.join(inputDir, 'png');
const sizes = [64, 128, 256, 512];

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
  const svgFiles = await listSvgFiles();

  if (svgFiles.length === 0) {
    throw new Error('No SVG files found in sub-universe-logos.');
  }

  await ensureDir(outputDir);

  for (const size of sizes) {
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
}

exportPngs()
  .then(() => {
    console.log('Sub-universe PNG exports complete.');
  })
  .catch((error) => {
    console.error('Sub-universe PNG export failed:', error);
    process.exit(1);
  });
