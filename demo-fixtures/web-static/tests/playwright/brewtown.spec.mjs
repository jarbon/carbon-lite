import { expect, test } from '@playwright/test';

const baseUrl = process.env.CARBON_DEMO_URL || 'http://127.0.0.1:8080';

test('contact form explains and recovers from an invalid submission', async ({ page }) => {
  await page.goto(`${baseUrl}/contact.html`);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('[data-for="name"]')).not.toHaveText('');
  await page.getByLabel('Name *').fill('Demo Customer');
  await page.getByLabel('Email *').fill('demo@example.test');
  await page.getByLabel(/Message/).fill('Hello from CARBON');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText(/thank|sent/i);
});
