// scripts/generate-logo-assets.mjs
//
// Single-source logo asset generator for the SoundSense marketing site.
// Reads assets/brand/soundsense-logo.svg and produces every PNG/ICO
// derivative the site needs. Idempotent: each target is unlinked and
// regenerated on every run.
//
// Run with: npm run build:logo

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/brand/soundsense-logo.svg');

const CARAMEL = '#C2956B';
const CREAM = '#FAF7F2';
const DARK = '#2C1810';

// Source SVG aspect is 374:379.
const SRC_W = 374;
const SRC_H = 379;

const targets = {
  logoSvgCopy: path.join(ROOT, 'images/logo.svg'),
  logo512: path.join(ROOT, 'images/logo-512.png'),
  logo1024: path.join(ROOT, 'images/logo-1024.png'),
  og: path.join(ROOT, 'images/og-image.png'),
  favIco: path.join(ROOT, 'favicon.ico'),
  fav16: path.join(ROOT, 'favicon-16.png'),
  fav32: path.join(ROOT, 'favicon-32.png'),
  fav96: path.join(ROOT, 'favicon-96.png'),
  fav192: path.join(ROOT, 'favicon-192.png'),
  appleTouch: path.join(ROOT, 'apple-touch-icon.png'),
};

async function ensureDir(p) {
  await fs.mkdir(path.dirname(p), { recursive: true });
}

async function unlinkIfExists(p) {
  try {
    await fs.unlink(p);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

function logoPng(svgBuffer, width, height) {
  // Target dimensions are chosen to match the 374:379 source aspect within
  // a rounding pixel. Use fit:'fill' to land on the exact requested size —
  // the sub-pixel aspect delta (<0.1%) is imperceptible.
  return sharp(svgBuffer, { density: 512 })
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();
}

function faviconPng(svgBuffer, size) {
  // Square favicon — letterbox to preserve aspect with transparent padding.
  return sharp(svgBuffer, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Build the 1200x630 Open Graph card as a single composed SVG and rasterize.
// Layout: logo mark + tagline centered as a group, vertically and horizontally.
async function buildOgImage(svgBuffer, outPath) {
  const W = 1200;
  const H = 630;
  const logoH = 320;
  const logoW = Math.round((logoH * SRC_W) / SRC_H); // ~316
  const gap = 48;
  const fontSize = 72;
  const tagline = 'Hear What Matters.';

  // Rough text width estimate. DM Sans Bold cap-height average width ~ 0.55em.
  // This is only used to center the group horizontally; exact text length is
  // set at render time by the SVG text element itself.
  const approxTextW = Math.round(tagline.length * fontSize * 0.5);
  const groupW = logoW + gap + approxTextW;
  const groupX = Math.round((W - groupW) / 2);
  const logoY = Math.round((H - logoH) / 2);
  const textX = groupX + logoW + gap;
  const textY = Math.round(H / 2) + Math.round(fontSize * 0.34); // optical baseline

  // Encode the source SVG as a data URI so it can be referenced from the OG SVG.
  const logoDataUri = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;

  const og = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <image href="${logoDataUri}" x="${groupX}" y="${logoY}" width="${logoW}" height="${logoH}"/>
  <text x="${textX}" y="${textY}"
        font-family="'DM Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        font-weight="700"
        font-size="${fontSize}"
        fill="${DARK}"
        letter-spacing="-0.02em">${tagline}</text>
</svg>`;

  try {
    // Check DM Sans presence for a warning. sharp doesn't expose installed
    // fonts, so we just log a generic notice; actual resolution happens in
    // librsvg/pango at render time.
    console.log('[og] Using font cascade: DM Sans → Segoe UI → Arial. If DM Sans is not installed on the build machine, the fallback will render.');
  } catch {}

  // Force exact 1200x630 output — density can otherwise upscale the rasterization.
  await sharp(Buffer.from(og, 'utf8'))
    .resize(W, H, { fit: 'fill' })
    .png()
    .toFile(outPath);
}

// Apple touch icon: caramel background filled edge-to-edge, logo centered on top.
// iOS will round-corner this automatically on the home screen.
async function buildAppleTouchIcon(svgBuffer, outPath) {
  const size = 180;
  // Inset the mark a bit so its visible shapes sit nicely inside the filled square.
  const mark = await sharp(svgBuffer, { density: 384 })
    .resize({ width: Math.round(size * 0.86), height: Math.round(size * 0.86), fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: CARAMEL,
    },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(outPath);
}

async function main() {
  const svgBuffer = await fs.readFile(SRC);

  for (const p of Object.values(targets)) {
    await ensureDir(p);
    await unlinkIfExists(p);
  }

  // 1. Copy SVG source to images/logo.svg
  await fs.writeFile(targets.logoSvgCopy, svgBuffer);

  // 2. Logo PNG sizes for hi-dpi use (aspect ratio 374:379)
  await fs.writeFile(targets.logo512, await logoPng(svgBuffer, 512, 519));
  await fs.writeFile(targets.logo1024, await logoPng(svgBuffer, 1024, 1037));

  // 3. Favicon PNG sizes (square, letterboxed to preserve aspect; transparent bg)
  for (const [outPath, size] of [
    [targets.fav16, 16],
    [targets.fav32, 32],
    [targets.fav96, 96],
    [targets.fav192, 192],
  ]) {
    await fs.writeFile(outPath, await faviconPng(svgBuffer, size));
  }

  // 4. Multi-size ICO (16, 32, 48) via png-to-ico.
  const icoBuf = await pngToIco([
    await faviconPng(svgBuffer, 16),
    await faviconPng(svgBuffer, 32),
    await faviconPng(svgBuffer, 48),
  ]);
  await fs.writeFile(targets.favIco, icoBuf);

  // 5. Apple touch icon with caramel fill background
  await buildAppleTouchIcon(svgBuffer, targets.appleTouch);

  // 6. Open Graph card
  await buildOgImage(svgBuffer, targets.og);

  // Report sizes.
  const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
  for (const [name, p] of Object.entries(targets)) {
    const st = await fs.stat(p);
    console.log(`  ${String(st.size).padStart(8)} bytes  ${rel(p)}  (${name})`);
  }
  console.log('\nLogo assets generated from assets/brand/soundsense-logo.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
