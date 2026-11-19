import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const rootDir = dirname(fileURLToPath(import.meta.url));
const appSrc = join(rootDir, 'app');
const shotsSrc = join(rootDir, 'screenshots');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDst = join(outDir, 'app');
const shotsDst = join(outDir, 'screenshots');
const dossierPath = join(outDir, 'dossier.json');
if (!existsSync(appSrc)) {
  throw new Error('missing app directory at ' + appSrc);
}
if (!existsSync(shotsSrc)) {
  throw new Error('missing screenshots directory at ' + shotsSrc);
}
if (!statSync(appSrc).isDirectory()) {
  throw new Error('app path is not a directory');
}
if (!statSync(shotsSrc).isDirectory()) {
  throw new Error('screenshots path is not a directory');
}
mkdirSync(outDir, { recursive: true });
cpSync(appSrc, appDst, { recursive: true });
cpSync(shotsSrc, shotsDst, { recursive: true });
const dossier = buildDossier(outDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648, app_path_max_bytes: 1000 });
writeFileSync(dossierPath, dossier);
const dossierBytes = statSync(dossierPath).size;
const shotCount = readdirSync(shotsDst).length;
console.log('vice-frame hand-in complete');
console.log('output dir: ' + outDir);
console.log('copied app -> ' + appDst);
console.log('copied screenshots -> ' + shotsDst + ' (' + shotCount + ' files)');
console.log('dossier bytes: ' + dossierBytes);
