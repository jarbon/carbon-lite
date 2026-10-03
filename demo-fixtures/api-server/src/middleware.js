// Middleware helpers: JSON body parsing, auth, response helpers, logging.
// Deliberately public fixture value. Never inherit a real user's API credentials.
// This synthetic demo is for local evaluation, not production deployment.
const API_KEY = 'secret-dev-key';
const MAX_BODY_BYTES = 1024 * 100; // 100 KB

export function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function sendError(res, statusCode, message, details) {
  const payload = { error: message };
  if (details) payload.details = details;
  sendJson(res, statusCode, payload);
}

export function requireApiKey(req, res) {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    sendError(res, 401, 'Missing or invalid X-API-Key header');
    return false;
  }
  return true;
}

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')));
      } catch {
        reject(Object.assign(new Error('Invalid JSON in request body'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

export function logRequest(req, res, startedAt) {
  const ms = Date.now() - startedAt;
  // Keep logging quiet during tests.
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.url} -> ${res.statusCode} (${ms}ms)`);
  }
}
