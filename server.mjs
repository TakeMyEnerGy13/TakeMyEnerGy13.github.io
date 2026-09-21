import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !['.html', '.css', '.js', '.svg', '.ttf', '.woff2', '.jpg', '.png', '.webp'].includes(extname(file))) {
      res.writeHead(404).end('Not found');
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)], 'Cache-Control': 'no-cache' }).end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
});
server.listen(Number(process.env.PORT) || 4173, '127.0.0.1', () => console.log(`Portfolio: http://127.0.0.1:${server.address().port}`));
