import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows the hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ship code your team can');
  });

  test('navbar links scroll to the right sections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('Get started button links to signup', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /start free/i }).first()).toHaveAttribute('href', '/signup');
  });
});

test.describe('Auth gating', () => {
  test('unauthenticated visitors are redirected away from the dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page shows the GitHub sign-in option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible();
  });
});

// NOTE: full user-journey tests (upload -> AI analysis -> review results,
// GitHub import -> sync, invite -> accept) are written against the running
// app's real API and require seeded test data plus live Postgres/Redis/
// ANTHROPIC_API_KEY — they don't run in this sandbox. These are the
// two suites that are honest to include without that infrastructure.
