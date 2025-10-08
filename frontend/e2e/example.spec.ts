import { test, expect } from '@playwright/test';

test.describe('Basic PWA functionality', () => {
  test('should load the app', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('should have valid manifest', async ({ page }) => {
    await page.goto('/');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });

  test('should register service worker', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('/');

    // Wait for service worker registration
    await page.waitForTimeout(2000);

    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });

    expect(swRegistered).toBe(true);
  });
});

test.describe('Offline functionality', () => {
  test('should work offline after initial load', async ({ page, context }) => {
    // Load the app online first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Navigate (should still work from cache)
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Login');

    // Go back online
    await context.setOffline(false);
  });
});
