import { test, expect } from '@playwright/test';

/**
 * Real end-to-end smoke test for the "Use My Current Location" flow.
 *
 * This exists because unit tests on extracted logic (lib/geolocation.ts)
 * do NOT catch real-world integration failures like:
 *   - Google Maps API key referrer/domain restrictions
 *   - Missing/misconfigured env vars on the deployed site
 *   - Script loading failures
 *   - Actual browser console errors
 *
 * Run against production before telling anyone a fix "works":
 *   E2E_BASE_URL=https://cyberpicksupatl.com npx playwright test
 */

test.describe('Booking flow — location step', () => {
  test('page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/book/', { waitUntil: 'networkidle' });

    expect(consoleErrors, `Console errors on page load:\n${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('destination input and location button are visible', async ({ page }) => {
    await page.goto('/book/', { waitUntil: 'networkidle' });

    await expect(page.getByPlaceholder(/where are you going/i)).toBeVisible();
    await expect(page.getByText('Use My Current Location')).toBeVisible();
  });

  test('"Use My Current Location" successfully fills the address field', async ({ browser }) => {
    // Grant geolocation permission and set a known coordinate (ATL area)
    const context = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 33.749, longitude: -84.388 },
    });
    const page = await context.newPage();

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/book/', { waitUntil: 'networkidle' });
    await page.getByText('Use My Current Location').click();

    // Wait for either the address field to populate or an error message to appear
    const addressInput = page.getByPlaceholder(/where are you going/i);
    const errorMessage = page.locator('.text-red-400');

    await Promise.race([
      addressInput.waitFor({ state: 'visible' }).then(async () => {
        await expect
          .poll(async () => addressInput.inputValue(), { timeout: 10_000 })
          .not.toBe('');
      }),
      errorMessage.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}),
    ]);

    const errorVisible = await errorMessage.isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      throw new Error(
        `Geolocation flow surfaced an error: "${errorText}". Console errors: ${consoleErrors.join('; ') || 'none'}`,
      );
    }

    const addressValue = await addressInput.inputValue();
    expect(addressValue.trim().length, 'Address field should be populated after geolocation').toBeGreaterThan(0);

    // Explicitly fail on known Google Maps auth errors even if the UI didn't surface them
    const mapsAuthError = consoleErrors.find((e) =>
      /RefererNotAllowedMapError|InvalidKeyMapError|ApiNotActivatedMapError/.test(e),
    );
    expect(mapsAuthError, `Google Maps auth/config error detected: ${mapsAuthError}`).toBeUndefined();

    await context.close();
  });
});
