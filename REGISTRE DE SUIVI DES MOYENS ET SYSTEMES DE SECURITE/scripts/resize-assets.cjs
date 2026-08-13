const { Decoder, Encoder } = require('ico-endec');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const SCALE_LOGO = 1.5;   // +50%
const SCALE_STAMP = 1.2;  // +20%

async function resizeICO() {
  const icoPath = path.join(__dirname, '..', 'public', 'logo.ico');
  const buf = fs.readFileSync(icoPath);
  const decoder = new Decoder(buf);
  const images = decoder.decode();

  console.log('Original ICO images:');
  const pngBuffers = [];

  for (const img of images) {
    const newW = Math.round(img.width * SCALE_LOGO);
    const newH = Math.round(img.height * SCALE_LOGO);
    console.log(`  ${img.width}x${img.height} → ${newW}x${newH}`);

    // Reconstruct RGBA from ICO raw BMP data (BGRA, bottom-up)
    const srcCanvas = createCanvas(img.width, img.height);
    const srcCtx = srcCanvas.getContext('2d');
    const imgData = srcCtx.createImageData(img.width, img.height);
    const rowSize = Math.ceil((img.width * img.bitsPerPixel) / 32) * 4;

    for (let y = 0; y < img.height; y++) {
      const srcRow = img.height - 1 - y;
      for (let x = 0; x < img.width; x++) {
        const srcIdx = srcRow * rowSize + x * 4;
        const dstIdx = (y * img.width + x) * 4;
        imgData.data[dstIdx]     = img.imageData[srcIdx + 2]; // R ← B
        imgData.data[dstIdx + 1] = img.imageData[srcIdx + 1]; // G
        imgData.data[dstIdx + 2] = img.imageData[srcIdx];     // B ← R
        imgData.data[dstIdx + 3] = img.imageData[srcIdx + 3]; // A
      }
    }
    srcCtx.putImageData(imgData, 0, 0);

    // Resize with high quality
    const dstCanvas = createCanvas(newW, newH);
    const dstCtx = dstCanvas.getContext('2d');
    dstCtx.imageSmoothingEnabled = true;
    dstCtx.imageSmoothingQuality = 'high';
    dstCtx.drawImage(srcCanvas, 0, 0, newW, newH);

    // Export as PNG buffer
    pngBuffers.push(dstCanvas.toBuffer('image/png'));
  }

  // Encode back to ICO (takes array of PNG buffers)
  const encoder = new Encoder(pngBuffers);
  const newIco = encoder.encode();
  fs.writeFileSync(icoPath, Buffer.from(newIco));
  const stat = fs.statSync(icoPath);
  console.log(`\nNew logo.ico: ${stat.size} bytes`);
}

async function resizeStamp() {
  const stampPath = path.join(__dirname, '..', 'public', 'stamp_small.png');
  const oldStat = fs.statSync(stampPath);
  const img = await loadImage(stampPath);
  const newW = Math.round(img.width * SCALE_STAMP);
  const newH = Math.round(img.height * SCALE_STAMP);
  console.log(`\nstamp_small.png: ${img.width}x${img.height} → ${newW}x${newH}`);

  const canvas = createCanvas(newW, newH);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, newW, newH);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(stampPath, buffer);
  const stat = fs.statSync(stampPath);
  console.log(`New stamp_small.png: ${stat.size} bytes (was ${oldStat.size} bytes)`);
}

(async () => {
  try {
    await resizeICO();
    await resizeStamp();
    console.log('\nDone!');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
