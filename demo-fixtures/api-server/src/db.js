// In-memory data store with seed data. Reset between tests via resetDb().
const SEED = [
  { id: 'b1', title: 'The Silent Harbor', author: 'M. Okafor', genre: 'mystery', price: 14.99, inStock: true },
  { id: 'b2', title: 'Starlight Protocol', author: 'J. Reyes', genre: 'scifi', price: 11.5, inStock: true },
  { id: 'b3', title: 'Bread & Salt', author: 'A. Kowalski', genre: 'nonfiction', price: 22.0, inStock: false },
  { id: 'b4', title: 'The Cartographer\'s Daughter', author: 'M. Okafor', genre: 'fiction', price: 16.25, inStock: true },
  { id: 'b5', title: 'Notes from the Deep', author: 'S. Lindqvist', genre: 'biography', price: 18.75, inStock: true },
  { id: 'b6', title: 'Quantum Alley', author: 'J. Reyes', genre: 'scifi', price: 9.99, inStock: false },
];

let books = [];
let nextId = 1;

export function resetDb() {
  books = SEED.map((b) => ({ ...b }));
  nextId = SEED.length + 1;
}

export function listBooks({ genre, author, q, limit, offset } = {}) {
  let result = books;
  if (genre) result = result.filter((b) => b.genre === genre);
  if (author) result = result.filter((b) => b.author.toLowerCase().includes(author.toLowerCase()));
  if (q) {
    const needle = q.toLowerCase();
    result = result.filter(
      (b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle)
    );
  }
  const total = result.length;
  const off = Number.isFinite(offset) ? offset : 0;
  const lim = Number.isFinite(limit) ? limit : total;
  return { total, books: result.slice(off, off + lim) };
}

export function getBook(id) {
  return books.find((b) => b.id === id) || null;
}

export function createBook(fields) {
  const book = { id: `b${nextId++}`, ...fields };
  books.push(book);
  return book;
}

export function updateBook(id, fields) {
  const book = getBook(id);
  if (!book) return null;
  Object.assign(book, fields);
  return book;
}

export function deleteBook(id) {
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  books.splice(idx, 1);
  return true;
}

export function stats() {
  const byGenre = {};
  let priceSum = 0;
  for (const b of books) {
    byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
    priceSum += b.price;
  }
  return {
    total: books.length,
    byGenre,
    averagePrice: books.length ? Number((priceSum / books.length).toFixed(2)) : 0,
    inStock: books.filter((b) => b.inStock).length,
  };
}

resetDb();
