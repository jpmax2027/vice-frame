import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const rootDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(rootDir, 'app');
const port = 8080;
const mime = new Map();
mime.set('.html', 'text/html; charset=utf-8');
mime.set('.css', 'text/css; charset=utf-8');
mime.set('.js', 'text/javascript; charset=utf-8');
mime.set('.mjs', 'text/javascript; charset=utf-8');
mime.set('.json', 'application/json; charset=utf-8');
mime.set('.jpg', 'image/jpeg');
mime.set('.jpeg', 'image/jpeg');
mime.set('.png', 'image/png');
mime.set('.svg', 'image/svg+xml');
mime.set('.ttf', 'font/ttf');
mime.set('.woff', 'font/woff');
mime.set('.woff2', 'font/woff2');
const server = createServer((req, res) => {
  const rawUrl = req.url ?? '/';
  const qIndex = rawUrl.indexOf('?');
  const urlPath = qIndex >= 0 ? rawUrl.slice(0, qIndex) : rawUrl;
  let decoded = '/';
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('bad request');
    return;
  }
  if (decoded === '/') {
    decoded = '/index.html';
  }
  const safePath = normalize(join(appDir, '.' + decoded));
  if (!safePath.startsWith(appDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('forbidden');
    return;
  }
  if (!existsSync(safePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
    return;
  }
  if (!statSync(safePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
    return;
  }
  const ext = extname(safePath).toLowerCase();
  const type = mime.get(ext) ?? 'application/octet-stream';
  const data = readFileSync(safePath);
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': String(data.length) });
  res.end(data);
});
server.listen(port, () => {
  console.log('vice-frame serving app/ at http://localhost:' + port);
});
