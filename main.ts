// Leonida Sunset Studio — hand-in program for make.fun's gta6-cover-art-01.
// Node 22, standard library only. The app itself is the static file tree in
// app/ (open app/index.html in a browser, no build step, no network). This
// program copies app/ and screenshots/ into the output directory and writes
// dossier.json there with the kit's vendored buildDossier library, exactly
// as the competition's hand-in contract prescribes.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
const localShots = join(repoRoot, 'screenshots');
if (existsSync(localShots)) {
  cpSync(localShots, shotsDir, { recursive: true });
}

// Caps mirror the sealed gate (reference/gate.json): the dossier text cap
// shapes the bytes; the rest refuse anything the scorer would refuse.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Sunset Studio handed in to ${outputDir} (dossier ${dossier.length} bytes)`);
