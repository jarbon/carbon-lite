// Integration tests: boot the real server on an ephemeral port and use fetch.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import { resetDb } from '../src/db.js';

process.env.NODE_ENV = 'test';
const API_KEY = 'secret-dev-key';

let server;
let baseUrl;

test.before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

test.beforeEach(() => resetDb());

test('GET /health returns ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});

test('GET /books returns the seed list', async () => {
  const res = await fetch(`${baseUrl}/books`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.total, 6);
  assert.equal(body.books.length, 6);
});

test('GET /books supports filtering and pagination', async () => {
  const res = await fetch(`${baseUrl}/books?genre=scifi&limit=1`);
  const body = await res.json();
  assert.equal(body.total, 2);
  assert.equal(body.books.length, 1);
  assert.equal(body.books[0].genre, 'scifi');
});

test('GET /books/:id returns one book, 404 for unknown', async () => {
  const ok = await fetch(`${baseUrl}/books/b1`);
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).id, 'b1');

  const missing = await fetch(`${baseUrl}/books/zzz`);
  assert.equal(missing.status, 404);
});

test('POST /books requires API key', async () => {
  const res = await fetch(`${baseUrl}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'X', author: 'Y', genre: 'fiction', price: 1 }),
  });
  assert.equal(res.status, 401);
});

test('POST /books creates a book with valid key and body', async () => {
  const res = await fetch(`${baseUrl}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ title: 'Brand New', author: 'Me', genre: 'fiction', price: 12.34 }),
  });
  assert.equal(res.status, 201);
  const book = await res.json();
  assert.ok(book.id);
  assert.equal(book.inStock, true);

  const list = await (await fetch(`${baseUrl}/books`)).json();
  assert.equal(list.total, 7);
});

test('POST /books rejects invalid bodies with 422 and details', async () => {
  const res = await fetch(`${baseUrl}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ title: '', genre: 'romance', price: -1 }),
  });
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.equal(body.error, 'Validation failed');
  assert.ok(Array.isArray(body.details));
  assert.ok(body.details.length >= 3);
});

test('POST /books rejects malformed JSON with 400', async () => {
  const res = await fetch(`${baseUrl}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: '{not json',
  });
  assert.equal(res.status, 400);
});

test('PUT /books/:id updates fields', async () => {
  const res = await fetch(`${baseUrl}/books/b2`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ price: 99.99, inStock: false }),
  });
  assert.equal(res.status, 200);
  const book = await res.json();
  assert.equal(book.price, 99.99);
  assert.equal(book.inStock, false);
  assert.equal(book.title, 'Starlight Protocol'); // untouched fields survive
});

test('PUT /books/:id with empty patch is a 422', async () => {
  const res = await fetch(`${baseUrl}/books/b2`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 422);
});

test('DELETE /books/:id removes the book', async () => {
  const res = await fetch(`${baseUrl}/books/b3`, {
    method: 'DELETE',
    headers: { 'X-API-Key': API_KEY },
  });
  assert.equal(res.status, 200);

  const gone = await fetch(`${baseUrl}/books/b3`);
  assert.equal(gone.status, 404);
});

test('GET /stats reflects current data', async () => {
  const res = await fetch(`${baseUrl}/stats`);
  assert.equal(res.status, 200);
  const s = await res.json();
  assert.equal(s.total, 6);
  assert.ok(s.averagePrice > 0);
});

test('unknown route is 404, wrong method is 405', async () => {
  assert.equal((await fetch(`${baseUrl}/nope`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/stats`, { method: 'DELETE' })).status, 405);
});
