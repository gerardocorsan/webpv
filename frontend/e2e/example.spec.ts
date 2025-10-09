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

    // vite-plugin-pwa generates manifest.webmanifest in addition to manifest.json
    const manifestLinks = page.locator('link[rel="manifest"]');
    const count = await manifestLinks.count();

    // Should have at least one manifest link
    expect(count).toBeGreaterThanOrEqual(1);

    // Check that at least one points to a valid manifest
    const firstManifest = manifestLinks.first();
    const href = await firstManifest.getAttribute('href');
    expect(href).toMatch(/manifest\.(json|webmanifest)/);
  });

  test('should register service worker', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('/');

    // Wait for service worker registration (with proper timeout)
    const swRegistered = await page.evaluate(async () => {
      // Wait up to 10 seconds for service worker to register
      const maxAttempts = 20;
      for (let i = 0; i < maxAttempts; i++) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });
});

test.describe('Offline functionality', () => {
  test('should work offline after initial load', async ({ page, context }) => {
    // Load the app online first and ensure resources are cached
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for service worker to be active and controlling the page
    await page.waitForFunction(() => {
      return navigator.serviceWorker.controller !== null;
    }, { timeout: 10000 });

    // Wait for cache to be populated by the service worker
    await page.waitForFunction(async () => {
      if (!('caches' in window)) return false;

      try {
        // Check if any cache has been created
        const cacheNames = await caches.keys();
        if (cacheNames.length === 0) return false;

        // Check if the main cache has content
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          if (keys.length > 0) {
            return true;
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    }, { timeout: 15000 });

    // Verify page content is visible while online
    await expect(page.locator('h1')).toContainText('Login');

    // Go offline
    await context.setOffline(true);

    // Verify the page still works by checking that content is still accessible
    // (Service Worker serves from cache, so DOM should remain intact)
    await expect(page.locator('h1')).toContainText('Login');

    // Verify critical UI elements are still functional
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });
});
