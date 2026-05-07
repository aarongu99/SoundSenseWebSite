// scripts/generate-app-icons.mjs
//
// Generates the Expo app icon, splash image, and Android adaptive-icon
// foreground from the canonical SoundSense brand SVG.
//
// Output goes to ../../assets/ in the SoundSense root project, so Expo can
// reference them from app.json as ./assets/icon.png, etc.
//
// Run with: node scripts/generate-app-icons.mjs   (from soundsense-site/)

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(HERE, '..');
const APP_ROOT = path.resolve(SITE_ROOT, '..');

const SRC_SVG = path.join(SITE_ROOT, 'assets/brand/soundsense-logo.svg');
const OUT_DIR = path.join(APP_ROOT, 'assets');

const CARAMEL = '#C2956B';
const CREAM = '#FAF7F2';

const SIZE = 1024;

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

// Render the source SVG (which is a caramel disk with a white ear mark) into
// a white-only mark on a transparent square. We do this by recoloring: load
// the SVG text, swap the caramel disk fill to transparent so only the white
// strokes remain.
async function renderWhiteMarkOnTransparent(width) {
  const svgText = await fs.readFile(SRC_SVG, 'utf8');
  // Replace the caramel disk fill with "none" so only the white inner mark renders.
  const stripped = svgText.replace(/fill="#C2956B"/i, 'fill="none"');
  return sharp(Buffer.from(stripped), { density: 512 })
    .resize(width, width, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

// iOS App Store icon: 1024x1024, fully opaque (NO alpha channel), caramel
// background filled edge-to-edge, white mark centered and inset so the artwork
// breathes after iOS rounds the corners.
async function buildIosIcon(outPath) {
  const inset = 0.78; // mark occupies ~78% of icon (safe inside iOS rounded mask)
  const markSize = Math.round(SIZE * inset);
  const mark = await renderWhiteMarkOnTransparent(markSize);

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: CARAMEL,
    },
  })
    .composite([{ input: mark, gravity: 'center' }])
    // App Store rejects icons with an alpha channel. flatten() blends any
    // transparency against caramel (visually a no-op since the canvas is
    // already opaque caramel), then removeAlpha() drops the channel itself
    // so the output PNG is RGB-only.
    .flatten({ background: CARAMEL })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

// Android adaptive icon foreground: 1024x1024 PNG with TRANSPARENT background.
// The android.adaptiveIcon.backgroundColor in app.json (#FAF7F2 cream) shows
// behind the foreground. We render the full caramel-disk mark inset to ~66%
// so it stays inside the launcher's safe zone after device-specific masking.
async function buildAndroidAdaptiveIcon(outPath) {
  const inset = 0.66;
  const markSize = Math.round(SIZE * inset);
  const svgBuffer = await fs.readFile(SRC_SVG);
  const mark = await sharp(svgBuffer, { density: 512 })
    .resize(markSize, markSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

// Splash image: 1024x1024 PNG with the caramel-disk mark centered on a
// transparent background. app.json's splash.backgroundColor #FAF7F2 (cream)
// fills behind it; resizeMode "contain" handles scaling per device.
async function buildSplashImage(outPath) {
  const inset = 0.5; // mark covers central 50% of splash canvas
  const markSize = Math.round(SIZE * inset);
  const svgBuffer = await fs.readFile(SRC_SVG);
  const mark = await sharp(svgBuffer, { density: 512 })
    .resize(markSize, markSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function main() {
  await ensureDir(OUT_DIR);

  const targets = {
    icon: path.join(OUT_DIR, 'icon.png'),
    adaptiveIcon: path.join(OUT_DIR, 'adaptive-icon.png'),
    splash: path.join(OUT_DIR, 'splash.png'),
  };

  await buildIosIcon(targets.icon);
  await buildAndroidAdaptiveIcon(targets.adaptiveIcon);
  await buildSplashImage(targets.splash);

  for (const [name, p] of Object.entries(targets)) {
    const st = await fs.stat(p);
    const meta = await sharp(p).metadata();
    console.log(
      `  ${String(st.size).padStart(8)} bytes  ${path
        .relative(APP_ROOT, p)
        .replace(/\\/g, '/')}  ${meta.width}x${meta.height} ${meta.channels}ch  (${name})`,
    );
  }
  console.log(`\nApp icons generated. Brand: ${CARAMEL} on ${CREAM}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
