import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('renders the home page with heading', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Home/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('has working navigation', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.locator('.nav-links a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('features section is present', async ({ page }) => {
    await page.goto('/');

    const features = page.locator('.features');
    await expect(features).toBeVisible();
    await expect(features.locator('h2')).toHaveText('Features');
  });

  test('progressive enhancement script loads', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-enhance="example"]');
      return el?.getAttribute('data-enhanced') === 'true';
    });

    const enhanced = page.locator('[data-enhanced="true"]');
    await expect(enhanced).toBeVisible();
  });
});
