// Unit tests: validators, router matching, db operations. No network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBook, parsePagination, GENRES } from '../src/validate.js';
import { Router } from '../src/router.js';
import * as db from '../src/db.js';

test('validateBook accepts a fully valid book', () => {
  const result = validateBook({
    title: 'A Title',
    author: 'Someone',
    genre: 'fiction',
    price: 10.5,
    inStock: false,
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.title, 'A Title');
  assert.equal(result.value.inStock, false);
});

test('validateBook defaults inStock to true on create', () => {
  const result = validateBook({ title: 'T', author: 'A', genre: 'scifi', price: 1 });
  assert.equal(result.ok, true);
  assert.equal(result.value.inStock, true);
});

test('validateBook rejects missing required fields', () => {
  const result = validateBook({});
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('title')));
  assert.ok(result.errors.some((e) => e.includes('author')));
  assert.ok(result.errors.some((e) => e.includes('genre')));
  assert.ok(result.errors.some((e) => e.includes('price')));
});

test('validateBook rejects bad genre and negative price', () => {
  const result = validateBook({ title: 'T', author: 'A', genre: 'romance', price: -2 });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('genre')));
  assert.ok(result.errors.some((e) => e.includes('price')));
});

test('validateBook rejects unknown fields', () => {
  const result = validateBook({ title: 'T', author: 'A', genre: 'fiction', price: 1, isbn: 'x' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('unknown field: isbn')));
});

test('validateBook partial mode allows sparse updates', () => {
  const result = validateBook({ price: 3.5 }, { partial: true });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { price: 3.5 });
});

test('validateBook trims whitespace on title and author', () => {
  const result = validateBook({ title: '  T  ', author: ' A ', genre: 'fiction', price: 1 });
  assert.equal(result.ok, true);
  assert.equal(result.value.title, 'T');
  assert.equal(result.value.author, 'A');
});

test('GENRES list is stable', () => {
  assert.deepEqual(GENRES, ['fiction', 'nonfiction', 'scifi', 'mystery', 'biography']);
});

test('parsePagination accepts valid values and drops junk', () => {
  assert.deepEqual(parsePagination({ limit: '10', offset: '5' }), { limit: 10, offset: 5 });
  assert.deepEqual(parsePagination({ limit: '-1', offset: 'abc' }), {});
  assert.deepEqual(parsePagination({ limit: '1000' }), {}); // over cap
  assert.deepEqual(parsePagination({}), {});
});

test('router matches static and param routes', () => {
  const router = new Router();
  const hits = [];
  router.get('/books', () => hits.push('list'));
  router.get('/books/:id', () => hits.push('one'));

  const list = router.match('GET', '/books');
  assert.ok(list && !list.methodNotAllowed);

  const one = router.match('GET', '/books/b42');
  assert.ok(one && !one.methodNotAllowed);
  assert.equal(one.params.id, 'b42');
});

test('router reports 405 vs 404 correctly', () => {
  const router = new Router();
  router.get('/books', () => {});
  assert.deepEqual(router.match('POST', '/books'), { methodNotAllowed: true });
  assert.equal(router.match('GET', '/nope'), null);
});

test('router tolerates trailing slash', () => {
  const router = new Router();
  router.get('/books', () => {});
  assert.ok(router.match('GET', '/books/'));
});

test('db CRUD roundtrip', () => {
  db.resetDb();
  const before = db.listBooks().total;

  const book = db.createBook({ title: 'New', author: 'X', genre: 'fiction', price: 5, inStock: true });
  assert.ok(book.id);
  assert.equal(db.listBooks().total, before + 1);

  const updated = db.updateBook(book.id, { price: 6 });
  assert.equal(updated.price, 6);

  assert.equal(db.deleteBook(book.id), true);
  assert.equal(db.getBook(book.id), null);
  assert.equal(db.deleteBook(book.id), false);
});

test('db filtering by genre, author, and text query', () => {
  db.resetDb();
  const scifi = db.listBooks({ genre: 'scifi' });
  assert.ok(scifi.total >= 2);
  assert.ok(scifi.books.every((b) => b.genre === 'scifi'));

  const byAuthor = db.listBooks({ author: 'okafor' });
  assert.ok(byAuthor.books.every((b) => b.author.toLowerCase().includes('okafor')));

  const byText = db.listBooks({ q: 'harbor' });
  assert.equal(byText.total, 1);
});

test('db pagination', () => {
  db.resetDb();
  const page = db.listBooks({ limit: 2, offset: 2 });
  assert.equal(page.books.length, 2);
  const all = db.listBooks();
  assert.deepEqual(page.books, all.books.slice(2, 4));
});

test('db stats aggregates', () => {
  db.resetDb();
  const s = db.stats();
  assert.equal(s.total, 6);
  assert.equal(typeof s.averagePrice, 'number');
  assert.ok(s.byGenre.scifi >= 2);
});
