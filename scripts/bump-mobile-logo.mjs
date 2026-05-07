// scripts/bump-mobile-logo.mjs
//
// One-shot site-wide CSS patch: makes the nav logo mark larger on mobile.
// All 27 HTML pages inline the same nav CSS, so this script updates them
// in lockstep. Idempotent — running it twice is a no-op.
//
// Run with: node scripts/bump-mobile-logo.mjs   (from soundsense-site/)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FIND = '.logo{font-size:16px;align-self:center}';
const REPLACE =
  '.logo{font-size:16px;align-self:center;gap:10px}.logo img{width:36px !important;height:36px !important}';

async function walk(dir, out = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'scripts') continue;
      await walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await walk(ROOT);
  let touched = 0;
  let alreadyOk = 0;
  for (const f of files) {
    const src = await fs.readFile(f, 'utf8');
    if (src.includes(REPLACE)) {
      alreadyOk++;
      continue;
    }
    if (!src.includes(FIND)) continue;
    const next = src.replace(FIND, REPLACE);
    await fs.writeFile(f, next, 'utf8');
    touched++;
    console.log(`  patched  ${path.relative(ROOT, f).replace(/\\/g, '/')}`);
  }
  console.log(`\n${touched} file(s) updated, ${alreadyOk} already up-to-date.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
