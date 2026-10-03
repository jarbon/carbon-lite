# Existing test examples

This folder is intentionally small. It lets CARBON demonstrate how it reads
existing evidence without mistaking a few checks for complete coverage.

- `manual-critical-flows.md` is a repeatable manual charter for menu and contact
  behavior.
- `playwright/brewtown.spec.mjs` is an optional browser smoke test. Run it only
  after installing Playwright in this disposable copy:

  ```bash
  npm init -y
  npm install --save-dev @playwright/test
  npx playwright test tests/playwright/brewtown.spec.mjs
  ```

Start the site with `python3 -m http.server 8080` before running the browser
test. These fixtures deliberately avoid a preinstalled dependency tree.
