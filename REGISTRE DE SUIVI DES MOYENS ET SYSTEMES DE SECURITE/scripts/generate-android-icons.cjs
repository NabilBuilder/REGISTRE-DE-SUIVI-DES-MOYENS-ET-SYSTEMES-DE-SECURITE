const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_PATH = path.join(ROOT, 'public', 'logo-256.png');
const ICO_PATH = path.join(ROOT, 'public', 'logo.ico');
const RES_DIR = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');
const PUBLIC_DIR = path.join(ROOT, 'public');

const DENSITIES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const LOGO_PADDING = 0.15;

async function main() {
  let srcImg;
  try {
    srcImg = await loadImage(SRC_PATH);
    console.log(`Source icon: ${SRC_PATH} (${srcImg.width}x${srcImg.height})`);
  } catch (e) {
    console.error(`Cannot load ${SRC_PATH}: ${e.message}`);
    process.exit(1);
  }

  for (const [density, size] of Object.entries(DENSITIES)) {
    const dir = path.join(RES_DIR, density);
    fs.mkdirSync(dir, { recursive: true });

    const pad = Math.round(size * LOGO_PADDING);
    const logoSize = size - pad * 2;

    // ic_launcher.png (square with white background + padding)
    const c1 = createCanvas(size, size);
    const ctx1 = c1.getContext('2d');
    ctx1.imageSmoothingEnabled = true;
    ctx1.imageSmoothingQuality = 'high';
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(0, 0, size, size);
    ctx1.drawImage(srcImg, pad, pad, logoSize, logoSize);
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), c1.toBuffer('image/png'));

    // ic_launcher_round.png (circular with white background + padding)
    const c2 = createCanvas(size, size);
    const ctx2 = c2.getContext('2d');
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = 'high';
    ctx2.beginPath();
    ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx2.clip();
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(0, 0, size, size);
    ctx2.drawImage(srcImg, pad, pad, logoSize, logoSize);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), c2.toBuffer('image/png'));

    // ic_launcher_foreground.png (for adaptive icon)
    const fgSize = Math.round(size * 108 / 48);
    const fgPad = Math.round(fgSize * 0.18);
    const fgLogo = fgSize - fgPad * 2;
    const c3 = createCanvas(fgSize, fgSize);
    const ctx3 = c3.getContext('2d');
    ctx3.imageSmoothingEnabled = true;
    ctx3.imageSmoothingQuality = 'high';
    ctx3.drawImage(srcImg, fgPad, fgPad, fgLogo, fgLogo);
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), c3.toBuffer('image/png'));

    console.log(`  ${density}: ${size}x${size} (fg: ${fgSize}x${fgSize})`);
  }

  // Generate larger PNGs for public/ (used by PWA and Electron)
  const publicSizes = [192, 256, 512];
  for (const size of publicSizes) {
    const pad = Math.round(size * LOGO_PADDING);
    const logoSize = size - pad * 2;
    const c = createCanvas(size, size);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(srcImg, pad, pad, logoSize, logoSize);
    const outPath = path.join(PUBLIC_DIR, `pwa-${size}x${size}.png`);
    fs.writeFileSync(outPath, c.toBuffer('image/png'));
    console.log(`  public: ${outPath} (${size}x${size})`);
  }

  // Generate logo.ico from 256px with white background
  const icoPad = Math.round(256 * LOGO_PADDING);
  const icoLogo = 256 - icoPad * 2;
  const cIco = createCanvas(256, 256);
  const ctxIco = cIco.getContext('2d');
  ctxIco.imageSmoothingEnabled = true;
  ctxIco.imageSmoothingQuality = 'high';
  ctxIco.fillStyle = '#ffffff';
  ctxIco.fillRect(0, 0, 256, 256);
  ctxIco.drawImage(srcImg, icoPad, icoPad, icoLogo, icoLogo);
  fs.writeFileSync(ICO_PATH, cIco.toBuffer('image/png'));
  console.log(`  ICO: ${ICO_PATH} (256x256)`);

  console.log('\nDone! All icons regenerated with white background + padding');
}

main().catch(e => { console.error(e); process.exit(1); });
