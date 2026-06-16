import { test, expect } from '@playwright/test';

test.describe('Sanity Check', () => {
  test('should load the page and verify the title', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Assert that the page title is correct
    await expect(page).toHaveTitle("Children's Academy PISA 2025 Dashboard");
  });
});
