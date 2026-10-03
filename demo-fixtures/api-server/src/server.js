// HTTP server + request pipeline. Run: node src/server.js
import http from 'node:http';
import { buildRouter } from './routes.js';
import { sendError, logRequest } from './middleware.js';

export function createServer() {
  const router = buildRouter();

  return http.createServer(async (req, res) => {
    const startedAt = Date.now();
    res.on('finish', () => logRequest(req, res, startedAt));

    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
      return sendError(res, 400, 'Malformed URL');
    }

    const query = Object.fromEntries(url.searchParams.entries());
    const matched = router.match(req.method, url.pathname);

    if (!matched) {
      return sendError(res, 404, `No route for ${req.method} ${url.pathname}`);
    }
    if (matched.methodNotAllowed) {
      return sendError(res, 405, `Method ${req.method} not allowed for ${url.pathname}`);
    }

    try {
      await matched.handler(req, res, { params: matched.params, query });
    } catch (err) {
      const status = err.statusCode || 500;
      if (status >= 500) console.error('Handler error:', err);
      sendError(res, status, status >= 500 ? 'Internal server error' : err.message);
    }
  });
}

// Only listen when run directly (tests import createServer instead).
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`Bookstore API listening on http://localhost:${port}`);
  });
}
