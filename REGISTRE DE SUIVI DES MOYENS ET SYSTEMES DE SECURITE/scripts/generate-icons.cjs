const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background circle
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - size * 0.02;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a';
  ctx.fill();

  // Shield shape
  const shieldW = size * 0.52;
  const shieldH = size * 0.6;
  const shieldX = centerX - shieldW / 2;
  const shieldY = centerY - shieldH / 2 + size * 0.02;

  ctx.beginPath();
  ctx.moveTo(centerX, shieldY);
  ctx.lineTo(shieldX + shieldW, shieldY + size * 0.08);
  ctx.lineTo(shieldX + shieldW, shieldY + shieldH * 0.55);
  ctx.quadraticCurveTo(centerX, shieldY + shieldH + size * 0.04, centerX, shieldY + shieldH + size * 0.04);
  ctx.quadraticCurveTo(centerX, shieldY + shieldH + size * 0.04, shieldX, shieldY + shieldH * 0.55);
  ctx.lineTo(shieldX, shieldY + size * 0.08);
  ctx.closePath();

  const grad = ctx.createLinearGradient(shieldX, shieldY, shieldX, shieldY + shieldH);
  grad.addColorStop(0, '#3b82f6');
  grad.addColorStop(1, '#1e40af');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = size * 0.015;
  ctx.stroke();

  // Checkmark
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - size * 0.14, centerY + size * 0.01);
  ctx.lineTo(centerX - size * 0.03, centerY + size * 0.13);
  ctx.lineTo(centerX + size * 0.16, centerY - size * 0.12);
  ctx.stroke();

  // "GS" text below shield
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.11)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GS', centerX, centerY + shieldH / 2 + size * 0.12);

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath} (${size}x${size})`);
}

fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
generateIcon(192, 'pwa-192x192.png');
generateIcon(512, 'pwa-512x512.png');
generateIcon(512, 'pwa-maskable-512x512.png');
console.log('Icons generated successfully!');
