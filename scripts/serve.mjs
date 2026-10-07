import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.mjs':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.pdf':'application/pdf' };
const server = http.createServer(async (req, res) => {
  try {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (route.endsWith('/') ? route + 'index.html' : route));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    res.end(await readFile(file));
  } catch { res.writeHead(404, { 'Content-Type':'text/plain' }); res.end('Not found'); }
});
server.listen(4175, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4175'));
