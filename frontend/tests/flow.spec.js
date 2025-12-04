import { test, expect } from '@playwright/test';

test('basic flow: loads and fetches question', async ({ page }) => {
  // Setup the listener BEFORE navigating
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/api') && response.status() === 200
  );

  // Go to the app
  await page.goto('http://localhost:5173');



  // Check if kana-control is present
  const control = page.locator('kana-control');
  await expect(control).toBeVisible();

  // Wait for the response we started listening for
  const response = await responsePromise;
  
  const data = await response.json();
  expect(data.result).toHaveProperty('prompt');
  expect(data.result).toHaveProperty('answers');
});
