import { test, expect } from '@playwright/test';

/**
 * Real end-to-end smoke test for the booking flow's trip step.
 *
 * This exists because unit tests on extracted logic (lib/geolocation.ts,
 * lib/trip.ts) do NOT catch real-world integration failures like:
 *   - Google Maps API key referrer/domain restrictions
 *   - Missing/misconfigured env vars on the deployed site
 *   - Script loading failures
 *   - Actual browser console errors
 *
 * Run against production before telling anyone a fix "works":
 *   E2E_BASE_URL=https://cyberpicksupatl.com npx playwright test
 */

test.describe('Booking flow — trip step', () => {
  test('page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/book/', { waitUntil: 'networkidle' });

    expect(consoleErrors, `Console errors on page load:\n${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('pickup/destination pickers and schedule options are visible', async ({ page }) => {
    await page.goto('/book/', { waitUntil: 'networkidle' });

    await expect(page.getByText('Pickup Location')).toBeVisible();
    await expect(page.getByText('Destination')).toBeVisible();
    await expect(page.getByText('When do you need pickup?')).toBeVisible();
    await expect(page.getByText('Right Now')).toBeVisible();
    await expect(page.getByText('Schedule Ahead')).toBeVisible();
    await expect(page.getByText('Airport (ATL)').first()).toBeVisible();
  });

  test('airport pickup requires a terminal selection', async ({ page }) => {
    await page.goto('/book/', { waitUntil: 'networkidle' });

    // Pickup defaults to Airport/Domestic; fill a destination address manually
    const destInput = page.locator('input[placeholder="Enter an address"]');
    await destInput.waitFor({ state: 'visible' });
    await destInput.fill('123 Main St, Atlanta, GA 30303');

    await page.getByRole('button', { name: /get my quote/i }).click();

    // Should proceed to quote step (no validation error) since terminal defaults to domestic
    const errorVisible = await page.locator('.text-red-400').isVisible().catch(() => false);
    expect(errorVisible, 'Should not show a validation error with default domestic terminal selected').toBe(false);
  });

  test('"Use My Current Location" on the destination picker fills the address', async ({ browser }) => {
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

    // Switch destination to "Other Address" to reveal the manual entry + geolocate button.
    // There are two "Pickup Location" / "Destination" EndpointPicker blocks on the page;
    // scope to the one whose heading is literally "Destination" and grab its second
    // "Other Address" toggle button (pickup's is first).
    const otherAddressButtons = page.getByRole('button', { name: '📍 Other Address' });
    await otherAddressButtons.nth(1).click();

    const destSection = page.locator('label:has-text("Destination")').locator('xpath=..');
    const geolocateBtn = destSection.getByText('Use My Current Location');
    await geolocateBtn.click();

    const destInput = destSection.locator('input[placeholder="Enter an address"]');
    await expect
      .poll(async () => destInput.inputValue(), { timeout: 10_000 })
      .not.toBe('');

    const mapsAuthError = consoleErrors.find((e) =>
      /RefererNotAllowedMapError|InvalidKeyMapError|ApiNotActivatedMapError/.test(e),
    );
    expect(mapsAuthError, `Google Maps auth/config error detected: ${mapsAuthError}`).toBeUndefined();

    await context.close();
  });
});
