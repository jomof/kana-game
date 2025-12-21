import { test, expect } from '@playwright/test';

test('basic flow: loads and fetches question', async ({ page }) => {
  // Setup the listener BEFORE navigating - wait for getNextQuestion response specifically
  const responsePromise = page.waitForResponse(async response => {
    if (!response.url().includes('/api') || response.status() !== 200) {
      return false;
    }
    try {
      const body = await response.json();
      // Only match getNextQuestion responses (they have prompt field)
      return body.result && typeof body.result === 'object' && 'prompt' in body.result;
    } catch {
      return false;
    }
  });

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
  expect(data.result).toHaveProperty('answerGrammar');
});
