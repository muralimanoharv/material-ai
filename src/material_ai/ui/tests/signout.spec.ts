import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Material AI/)
})

test('backend health check returns 200', async ({ request }) => {
  const response = await request.get('/health');  
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});