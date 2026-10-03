# web-static — Brewtown Coffee (static site)

A multi-page static website with no build step. Good for testing tools against
plain HTML/CSS/JS: DOM manipulation, form validation, fetch of a local JSON
file, and localStorage.

## Pages

- `index.html` — landing page, hero, featured products loaded from `data/menu.json`
- `menu.html` — full menu with client-side category filtering and search
- `contact.html` — contact form with client-side validation, saves to localStorage
- `about.html` — plain content page

## Run

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 (a server is needed so `fetch()` of
`data/menu.json` works; opening via `file://` will not).

## Existing test examples

`tests/` contains a deliberately small manual charter and optional Playwright
smoke test. CARBON Demo can copy this fixture either with that folder intact or
without it, making the difference between discovery from scratch and existing
test inventory visible in one demo.
