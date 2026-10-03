# api-server — Bookstore REST API (Node.js, zero dependencies)

A REST API built on Node's built-in `http` module — no npm install needed.
Good for testing tools against backend patterns: routing, validation,
middleware, an in-memory data layer, and a real test suite (`node:test`).

Requires Node ≥ 18 (uses `node:test` and built-in `fetch` in tests).

## Run

```bash
node src/server.js            # listens on http://localhost:3000
PORT=4000 node src/server.js  # custom port
```

## Test

```bash
node --test test/
```

## API

All request/response bodies are JSON.

| Method | Path | Notes |
|---|---|---|
| GET    | `/health`        | liveness check |
| GET    | `/books`         | list; supports `?genre=`, `?author=`, `?q=`, `?limit=`, `?offset=` |
| GET    | `/books/:id`     | fetch one |
| POST   | `/books`         | create (requires `X-API-Key` header) |
| PUT    | `/books/:id`     | update (requires `X-API-Key` header) |
| DELETE | `/books/:id`     | delete (requires `X-API-Key` header) |
| GET    | `/stats`         | counts by genre, average price |

Write operations require header `X-API-Key: secret-dev-key` (see
`src/middleware.js`). This is a public synthetic fixture credential, not a secret.
The demo deliberately does not read API credentials from the user's environment.
Use this fixture locally only; it is not a production authentication system.

### Book shape

```json
{
  "id": "b1",
  "title": "string, required, 1-200 chars",
  "author": "string, required",
  "genre": "one of: fiction, nonfiction, scifi, mystery, biography",
  "price": 12.99,
  "inStock": true
}
```

## Structure

```
src/server.js       http server + request pipeline
src/router.js       method+pattern matcher
src/routes.js       endpoint handlers
src/db.js           in-memory store + seed data
src/validate.js     request body validation
src/middleware.js   auth, json body parsing, logging
test/unit.test.js         validators + router (no network)
test/integration.test.js  full server over real HTTP
```

## Existing test examples

The `test/` folder contains `node:test` unit and real-HTTP integration coverage
as well as `manual-api-boundaries.md`. CARBON Demo can omit the entire folder
for a clean discovery run or keep it to demonstrate existing-suite inventory.
