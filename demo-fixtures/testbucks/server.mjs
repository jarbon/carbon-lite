// Dependency-free, loopback-only fixture server. Never serves workspace files.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const storageKey = `testbucks-demo-${randomUUID()}`;
const files = new Map([
  ['/', ['Testbox.html', 'text/html; charset=utf-8']],
  ['/Testbox.html', ['Testbox.html', 'text/html; charset=utf-8']],
  ['/testbucks-cup.png', ['testbucks-cup.png', 'image/png']],
  ['/app.mjs', ['app.mjs', 'text/javascript; charset=utf-8']],
  ['/shop.mjs', ['shop.mjs', 'text/javascript; charset=utf-8']],
  ['/shop.css', ['shop.css', 'text/css; charset=utf-8']],
]);
const server = http.createServer((req, res) => {
  if (req.headers.host !== `127.0.0.1:${server.address().port}`) {
    res.writeHead(403).end('Loopback requests only'); return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
  }
  const file = files.get(req.url.split('?')[0]);
  if (!file) { res.writeHead(404).end('Not found'); return; }
  try {
    const raw = readFileSync(new URL(file[0], import.meta.url));
    // A unique key also isolates storage if the OS reuses an earlier demo port.
    const body = file[0] === 'Testbox.html'
      ? raw.toString('utf8').replace('data-session="testbucks-practice-v1"', `data-session="${storageKey}"`)
      : raw;
    res.writeHead(200, {
      'Content-Type': file[1], 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(500).end('Fixture asset unavailable'); }
});
// OS-assigned port avoids collisions. The per-process key isolates demo storage.
server.listen(0, '127.0.0.1', () => console.log(JSON.stringify({
  app: 'TestBucks', url: `http://127.0.0.1:${server.address().port}/Testbox.html`,
  synthetic: true, pid: process.pid,
})));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
