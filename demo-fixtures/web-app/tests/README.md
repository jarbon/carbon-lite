# Existing test examples

The TaskBoard copy has a concise manual lifecycle charter and one optional
Playwright test. Install Playwright only in this disposable demo copy:

```bash
npm init -y
npm install --save-dev @playwright/test
CARBON_DEMO_URL=http://127.0.0.1:8081 npx playwright test tests/playwright/taskboard.spec.mjs
```

Start the app first with `python3 -m http.server 8081`.
