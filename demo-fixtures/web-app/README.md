# web-app — TaskBoard (vanilla JS SPA)

A single-page task board application with no framework and no build step.
Good for testing tools against SPA patterns: hash routing, a central store
with pub/sub, component-style render functions, and async simulated APIs.

## Features

- Hash router (`#/board`, `#/task/:id`, `#/stats`, `#/settings`)
- Central store (`js/store.js`) with subscribe/notify
- Tasks: create, edit, complete, delete, priority, tags
- Stats page computed from store state
- State persisted to localStorage; seed data on first run

## Run

```bash
python3 -m http.server 8081
```

Then open http://localhost:8081

## Structure

```
index.html        app shell
css/app.css
js/app.js         boot + router wiring
js/router.js      tiny hash router
js/store.js       state container + persistence
js/api.js         fake async layer (latency-simulated)
js/views/         one module per route
```

## Existing test examples

`tests/` contains a small manual lifecycle charter plus an optional Playwright
flow. CARBON Demo supports copying this fixture with or without the folder so
the first run can demonstrate both new-test discovery and existing-test review.
