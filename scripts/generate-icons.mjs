import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCE = join(ROOT, 'mnt/data/icon-source.png');
const PUBLIC = join(ROOT, 'client/public');
const ICONS_DIR = join(PUBLIC, 'icons');

const outputs = [
  { path: join(PUBLIC, 'favicon-16x16.png'), size: 16 },
  { path: join(PUBLIC, 'favicon-32x32.png'), size: 32 },
  { path: join(PUBLIC, 'apple-touch-icon.png'), size: 180 },
  { path: join(PUBLIC, 'logo.png'), size: 180 },
  { path: join(ICONS_DIR, 'icon-192.png'), size: 192 },
  { path: join(ICONS_DIR, 'icon-512.png'), size: 512 },
];

const maskableOutput = { path: join(ICONS_DIR, 'maskable-icon-512.png'), size: 512, padding: 0.1 };

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  console.log('Generating icons from:', SOURCE);

  for (const { path, size } of outputs) {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path);
    console.log(`  Created: ${path} (${size}x${size})`);
  }

  const { path: maskPath, size: maskSize, padding } = maskableOutput;
  const innerSize = Math.round(maskSize * (1 - padding * 2));
  const offset = Math.round(maskSize * padding);

  const resizedIcon = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: maskSize,
      height: maskSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resizedIcon, left: offset, top: offset }])
    .png()
    .toFile(maskPath);
  console.log(`  Created: ${maskPath} (${maskSize}x${maskSize} maskable with ${padding * 100}% padding)`);

  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
