// Request body validation. Returns { ok: true, value } or { ok: false, errors }.
export const GENRES = ['fiction', 'nonfiction', 'scifi', 'mystery', 'biography'];

export function validateBook(body, { partial = false } = {}) {
  const errors = [];
  const value = {};

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['body must be a JSON object'] };
  }

  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (has('title')) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('title must be a non-empty string');
    } else if (body.title.length > 200) {
      errors.push('title must be at most 200 characters');
    } else {
      value.title = body.title.trim();
    }
  } else if (!partial) {
    errors.push('title is required');
  }

  if (has('author')) {
    if (typeof body.author !== 'string' || body.author.trim().length === 0) {
      errors.push('author must be a non-empty string');
    } else {
      value.author = body.author.trim();
    }
  } else if (!partial) {
    errors.push('author is required');
  }

  if (has('genre')) {
    if (!GENRES.includes(body.genre)) {
      errors.push(`genre must be one of: ${GENRES.join(', ')}`);
    } else {
      value.genre = body.genre;
    }
  } else if (!partial) {
    errors.push('genre is required');
  }

  if (has('price')) {
    if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
      errors.push('price must be a non-negative number');
    } else {
      value.price = body.price;
    }
  } else if (!partial) {
    errors.push('price is required');
  }

  if (has('inStock')) {
    if (typeof body.inStock !== 'boolean') {
      errors.push('inStock must be a boolean');
    } else {
      value.inStock = body.inStock;
    }
  } else if (!partial) {
    value.inStock = true; // default for creates
  }

  const allowed = ['title', 'author', 'genre', 'price', 'inStock'];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) {
      errors.push(`unknown field: ${key}`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, value };
}

export function parsePagination(query) {
  const out = {};
  if (query.limit !== undefined) {
    const n = Number(query.limit);
    if (Number.isInteger(n) && n > 0 && n <= 100) out.limit = n;
  }
  if (query.offset !== undefined) {
    const n = Number(query.offset);
    if (Number.isInteger(n) && n >= 0) out.offset = n;
  }
  return out;
}
