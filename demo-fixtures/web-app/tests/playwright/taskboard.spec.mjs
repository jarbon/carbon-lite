import { expect, test } from '@playwright/test';

const baseUrl = process.env.CARBON_DEMO_URL || 'http://127.0.0.1:8081';

test('a user can create a task and see it on the board', async ({ page }) => {
  await page.goto(`${baseUrl}/#/board`);
  await page.getByLabel('New task').fill('Plan CARBON demo');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText('Plan CARBON demo')).toBeVisible();
});
