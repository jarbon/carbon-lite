# TestBucks — CARBON's bundled demo app

A complete fictional coffee-shop training app: searchable menu, drink customization,
cart quantities, discounts and tax, simulated checkout success/decline/timeout,
order history, cancellation, persistence, and practice exercises. Enhanced October
23, 2026 with combined dietary/category/search filters, sorting, favorites, cart
editing, sold-out inventory, repeat orders, an explicit pickup lifecycle, and
simulated loyalty points with redemption and cancellation restoration.

Run `node server.mjs` in this disposable copy. Open the exact loopback URL printed
by the server; its port is allocated automatically. No npm install, API key,
model service, payment service, account, or Internet connection is required.
Use the coding agent's available built-in browser to test the app. Do not install
Selenium or Playwright just to run this demo. Stop the server after testing unless
the user asks to keep the demo open.

Use synthetic data only. Checkout, cancellation, and refunds are local simulations;
they never create real orders or move money. The app stores practice data in browser
local storage. A new server port separates it from earlier runs. The optional tests
folder includes manual charters and a runnable dependency-free suite:
`node --test tests/shop.test.mjs`. Its presence is not evidence that it ran.
The default without-existing-tests copy omits this folder so CARBON can discover
tests itself. Use the with-existing-tests profile to demonstrate existing coverage.

Read the visible Practice page for product rules. Exercise the app to establish
results: do not assume it contains bugs or treat a seeded-issue list as findings.
CARBON must generate its normal branded HTML report, evidence, confidence assessment,
coverage gaps, and useful next steps after the demo.

Source: Jason Arbon's TestBucks course app, `courses/how-ai-tests-software/Testbox.html`
and original `testbucks-cup.png`, bundled snapshot October 10, 2026. The application
is now a maintained CARBON-specific derivative; the course original is unchanged.
The local server serves only allowlisted assets and forbids outbound connections.
Each server session starts with a unique storage namespace; reloads preserve state,
but restarting the server starts a fresh session. The new version uses v2 state;
old v1 data is not migrated. Rewards are editable local training state, not a secure
wallet. Dietary labels are practice metadata, not allergy guarantees. Fictional training
brand, not affiliated with Starbucks. No Jev runner, credentials, recordings, or
course manuscripts are bundled.
