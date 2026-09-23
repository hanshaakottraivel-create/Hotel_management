import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0;
    rgbaBuffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function renderIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);

  // Colors
  const bgTop = [15, 23, 42, 255]; // #0f172a
  const bgMid = [30, 27, 75, 255]; // #1e1b4b
  const bgBottom = [10, 15, 29, 255];

  const goldPrimary = [245, 158, 11, 255]; // #f59e0b
  const goldLight = [251, 191, 36, 255]; // #fbbf24
  const goldDark = [217, 119, 6, 255]; // #d97706
  const purpleAccent = [99, 102, 241, 255]; // #6366f1

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    // alpha blend
    if (a < 255) {
      const srcA = a / 255;
      const dstA = buf[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
        buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
        buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
        buf[idx + 3] = Math.round(outA * 255);
      }
    } else {
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  function fillRect(x0, y0, w, h, col) {
    const rx0 = Math.max(0, Math.floor(x0));
    const ry0 = Math.max(0, Math.floor(y0));
    const rx1 = Math.min(size, Math.ceil(x0 + w));
    const ry1 = Math.min(size, Math.ceil(y0 + h));
    for (let y = ry0; y < ry1; y++) {
      for (let x = rx0; x < rx1; x++) {
        setPixel(x, y, col[0], col[1], col[2], col[3]);
      }
    }
  }

  function fillTriangle(x1, y1, x2, y2, x3, y3, col) {
    // Scanline fill
    const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)));
    const maxY = Math.min(size - 1, Math.ceil(Math.max(y1, y2, y3)));
    for (let y = minY; y <= maxY; y++) {
      let nodeX = [];
      const pts = [[x1, y1], [x2, y2], [x3, y3]];
      for (let i = 0; i < 3; i++) {
        const pA = pts[i];
        const pB = pts[(i + 1) % 3];
        if ((pA[1] < y && pB[1] >= y) || (pB[1] < y && pA[1] >= y)) {
          nodeX.push(pA[0] + (y - pA[1]) / (pB[1] - pA[1]) * (pB[0] - pA[0]));
        }
      }
      nodeX.sort((a, b) => a - b);
      if (nodeX.length >= 2) {
        const startX = Math.max(0, Math.floor(nodeX[0]));
        const endX = Math.min(size - 1, Math.ceil(nodeX[1]));
        for (let x = startX; x <= endX; x++) {
          setPixel(x, y, col[0], col[1], col[2], col[3]);
        }
      }
    }
  }

  function fillCircle(cx, cy, r, col) {
    const minX = Math.max(0, Math.floor(cx - r));
    const maxX = Math.min(size - 1, Math.ceil(cx + r));
    const minY = Math.max(0, Math.floor(cy - r));
    const maxY = Math.min(size - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        if (d2 <= r2) {
          const edge = Math.sqrt(d2);
          const alpha = Math.min(1, Math.max(0, r + 0.5 - edge));
          setPixel(x, y, col[0], col[1], col[2], Math.round(col[3] * alpha));
        }
      }
    }
  }

  function fillRoundedRect(x0, y0, w, h, radius, col) {
    const x1 = x0 + w;
    const y1 = y0 + h;
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
      for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
        let inside = true;
        if (x < x0 + radius && y < y0 + radius) {
          inside = ((x - (x0 + radius)) ** 2 + (y - (y0 + radius)) ** 2) <= radius ** 2;
        } else if (x > x1 - radius && y < y0 + radius) {
          inside = ((x - (x1 - radius)) ** 2 + (y - (y0 + radius)) ** 2) <= radius ** 2;
        } else if (x < x0 + radius && y > y1 - radius) {
          inside = ((x - (x0 + radius)) ** 2 + (y - (y1 - radius)) ** 2) <= radius ** 2;
        } else if (x > x1 - radius && y > y1 - radius) {
          inside = ((x - (x1 - radius)) ** 2 + (y - (y1 - radius)) ** 2) <= radius ** 2;
        }
        if (inside) {
          setPixel(x, y, col[0], col[1], col[2], col[3]);
        }
      }
    }
  }

  // Draw Background
  const cornerRadius = isMaskable ? 0 : Math.round(size * 0.22);
  for (let y = 0; y < size; y++) {
    const t = y / size;
    let r, g, b;
    if (t < 0.5) {
      const lt = t * 2;
      r = Math.round(bgTop[0] * (1 - lt) + bgMid[0] * lt);
      g = Math.round(bgTop[1] * (1 - lt) + bgMid[1] * lt);
      b = Math.round(bgTop[2] * (1 - lt) + bgMid[2] * lt);
    } else {
      const lt = (t - 0.5) * 2;
      r = Math.round(bgMid[0] * (1 - lt) + bgBottom[0] * lt);
      g = Math.round(bgMid[1] * (1 - lt) + bgBottom[1] * lt);
      b = Math.round(bgMid[2] * (1 - lt) + bgBottom[2] * lt);
    }

    for (let x = 0; x < size; x++) {
      let isInside = true;
      if (!isMaskable && cornerRadius > 0) {
        if (x < cornerRadius && y < cornerRadius) {
          isInside = ((x - cornerRadius) ** 2 + (y - cornerRadius) ** 2) <= cornerRadius ** 2;
        } else if (x > size - cornerRadius && y < cornerRadius) {
          isInside = ((x - (size - cornerRadius)) ** 2 + (y - cornerRadius) ** 2) <= cornerRadius ** 2;
        } else if (x < cornerRadius && y > size - cornerRadius) {
          isInside = ((x - cornerRadius) ** 2 + (y - (size - cornerRadius)) ** 2) <= cornerRadius ** 2;
        } else if (x > size - cornerRadius && y > size - cornerRadius) {
          isInside = ((x - (size - cornerRadius)) ** 2 + (y - (size - cornerRadius)) ** 2) <= cornerRadius ** 2;
        }
      }
      if (isInside) {
        setPixel(x, y, r, g, b, 255);
      }
    }
  }

  // Scale and center hotel emblem
  // Maskable: scale to 65% for safe zone. Standard: scale to 82%
  const scale = isMaskable ? (size / 512) * 0.65 : (size / 512) * 0.82;
  const offsetX = (size - 512 * scale) / 2;
  const offsetY = (size - 512 * scale) / 2;

  function tx(x) { return offsetX + x * scale; }
  function ty(y) { return offsetY + y * scale; }
  function ts(val) { return val * scale; }

  // 5 Stars
  const starPositions = [
    [174, 126, 8],
    [214, 114, 10],
    [256, 102, 13],
    [298, 114, 10],
    [338, 126, 8]
  ];
  for (const [sx, sy, sr] of starPositions) {
    fillCircle(tx(sx), ty(sy), ts(sr), goldLight);
  }

  // Pediment triangle (Roof)
  fillTriangle(tx(256), ty(150), tx(135), ty(210), tx(377), ty(210), goldLight);
  fillRect(tx(128), ty(210), ts(256), ts(14), goldPrimary);

  // 4 Columns
  const colsX = [156, 210, 282, 336];
  for (const cx of colsX) {
    fillRect(tx(cx - 5), ty(228), ts(32), ts(8), goldPrimary);
    fillRect(tx(cx), ty(236), ts(22), ts(134), goldLight);
    fillRect(tx(cx - 5), ty(370), ts(32), ts(8), goldPrimary);
  }

  // Grand Arch Entrance in center
  fillRect(tx(238), ty(294), ts(36), ts(84), purpleAccent);
  fillCircle(tx(256), ty(294), ts(18), purpleAccent);
  fillCircle(tx(266), ty(336), ts(3.5), goldLight);

  // Steps / Podium base
  fillRect(tx(120), ty(378), ts(272), ts(14), goldPrimary);
  fillRect(tx(104), ty(394), ts(304), ts(16), goldDark);
  fillRect(tx(88), ty(412), ts(336), ts(16), goldPrimary);

  return encodePNG(size, size, buf);
}

// Generate files
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons in /public...');

// 1. 192x192
const pwa192 = renderIcon(192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('Created pwa-192x192.png');

// 2. 512x512
const pwa512 = renderIcon(512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('Created pwa-512x512.png');

// 3. 512x512 Maskable (full bleed background, padded emblem)
const pwaMaskable512 = renderIcon(512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);
console.log('Created pwa-maskable-512x512.png');

// 4. apple-touch-icon 180x180 (for iOS Safari)
const appleTouch180 = renderIcon(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch180);
console.log('Created apple-touch-icon.png');

// 5. favicon.ico
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), appleTouch180);
console.log('Created favicon.ico');

console.log('All icons generated successfully.');
