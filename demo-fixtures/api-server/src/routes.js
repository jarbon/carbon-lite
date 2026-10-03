// Endpoint handlers wired into a Router instance.
import { Router } from './router.js';
import * as db from './db.js';
import { validateBook, parsePagination } from './validate.js';
import { sendJson, sendError, requireApiKey, readJsonBody } from './middleware.js';

export function buildRouter() {
  const router = new Router();

  router.get('/health', (req, res) => {
    sendJson(res, 200, { status: 'ok', uptime: process.uptime() });
  });

  router.get('/books', (req, res, { query }) => {
    const { total, books } = db.listBooks({
      genre: query.genre,
      author: query.author,
      q: query.q,
      ...parsePagination(query),
    });
    sendJson(res, 200, { total, books });
  });

  router.get('/books/:id', (req, res, { params }) => {
    const book = db.getBook(params.id);
    if (!book) return sendError(res, 404, `No book with id ${params.id}`);
    sendJson(res, 200, book);
  });

  router.post('/books', async (req, res) => {
    if (!requireApiKey(req, res)) return;
    const body = await readJsonBody(req);
    const result = validateBook(body ?? {});
    if (!result.ok) return sendError(res, 422, 'Validation failed', result.errors);
    const book = db.createBook(result.value);
    sendJson(res, 201, book);
  });

  router.put('/books/:id', async (req, res, { params }) => {
    if (!requireApiKey(req, res)) return;
    const body = await readJsonBody(req);
    const result = validateBook(body ?? {}, { partial: true });
    if (!result.ok) return sendError(res, 422, 'Validation failed', result.errors);
    if (Object.keys(result.value).length === 0) {
      return sendError(res, 422, 'Validation failed', ['no updatable fields provided']);
    }
    const book = db.updateBook(params.id, result.value);
    if (!book) return sendError(res, 404, `No book with id ${params.id}`);
    sendJson(res, 200, book);
  });

  router.delete('/books/:id', (req, res, { params }) => {
    if (!requireApiKey(req, res)) return;
    const removed = db.deleteBook(params.id);
    if (!removed) return sendError(res, 404, `No book with id ${params.id}`);
    sendJson(res, 200, { deleted: params.id });
  });

  router.get('/stats', (req, res) => {
    sendJson(res, 200, db.stats());
  });

  return router;
}
