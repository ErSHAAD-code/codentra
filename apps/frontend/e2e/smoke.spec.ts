import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows the hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
  });

  test('navbar links are visible and rendered', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Features' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pricing' }).first()).toBeVisible();
  });

  test('Get started CTA links to login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /start for free/i }).first()).toHaveAttribute('href', '/login');
  });
});

test.describe('Authentication', () => {
  test('login page renders GitHub sign-in button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible();
  });
});
