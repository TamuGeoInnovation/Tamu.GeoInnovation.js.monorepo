import { Page } from '@playwright/test';

import { PHONE_VIEWPORT, expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { waitForMapReady } from './map-probe';

/**
 * On a phone, a building's sheet can be closed (#1439).
 *
 * Tapping a building opens its details in a sheet along the bottom of the screen, about 85% of it on a phone. The sheet
 * drew a drag handle, the grey pill along its top, but dragging it down did nothing, and it had no close control: on
 * production on 27 November 2026, a 300 pixel drag left it exactly where it was. Since the sheet covers the map controls,
 * GPS among them, a visitor who chose a building first could not reach them (#1440).
 *
 * Both routes out a bottom sheet is expected to have: the handle is made true, and a close control is added beside it,
 * because a function done by dragging must also be possible with a single tap (WCAG 2.2, 2.5.7).
 */

const SHEET = 'tamu-gisc-feature-mobile-popup .popup';
const HANDLE = 'tamu-gisc-feature-mobile-popup .handle';

/** A building that opens its sheet by link. */
const BUILDING = '/map/m?bldg=0468';

test.use({ viewport: PHONE_VIEWPORT, isMobile: true, hasTouch: true });

/** Opens the building's sheet, as a link does, and closes any notice lying over the map first. */
async function openSheet(page: Page): Promise<void> {
  await blockAnalytics(page);
  await page.goto(BUILDING);
  await waitForMapReady(page, `the map at ${BUILDING} never finished loading`);

  // By the notice's own close button, not Escape: Escape closes the building's sheet too, which the link has opened.
  for (let closed = 0; closed < 3 && (await page.locator('tamu-gisc-modal-host').count()) > 0; closed++) {
    await page.locator('tamu-gisc-modal-host').getByRole('button', { name: 'Close window' }).first().click();
    await page.waitForTimeout(500);
  }

  await expect(page.locator(SHEET), `${BUILDING} did not open the building's sheet`).toContainText('Evans', {
    timeout: 30_000
  });
  await expect(page.locator(SHEET)).not.toHaveClass(/hidden/);
}

/** Drags the sheet's handle straight down by `distance` pixels, in small steps as a finger would. */
async function dragHandleDown(page: Page, distance: number): Promise<void> {
  const box = await page.locator(HANDLE).boundingBox();

  expect(box, 'the sheet has no drag handle').not.toBeNull();

  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  const steps = Math.max(4, Math.round(distance / 20));

  await page.mouse.move(x, y);
  await page.mouse.down();

  for (let step = 1; step <= steps; step++) {
    await page.mouse.move(x, y + (distance * step) / steps);
    await page.waitForTimeout(16);
  }

  await page.mouse.up();
  await page.waitForTimeout(1_000);
}

test.describe("on a phone, a building's sheet can be closed (#1439)", () => {
  test('by its close control', async ({ page }) => {
    await openSheet(page);

    const close = page.locator('tamu-gisc-feature-mobile-popup').getByRole('button', { name: 'Close' });

    await expect(close, 'the sheet has no close control').toBeVisible();
    await close.click();
    await expect(page.locator(SHEET), 'the close control did not close the sheet').toHaveClass(/hidden/, { timeout: 10_000 });
  });

  test('by dragging its handle down', async ({ page }) => {
    await openSheet(page);
    await dragHandleDown(page, 200);

    await expect(page.locator(SHEET), 'dragging the handle down did not close the sheet').toHaveClass(/hidden/, {
      timeout: 10_000
    });
  });

  test('and stays open when the handle is only nudged', async ({ page }) => {
    await openSheet(page);
    await dragHandleDown(page, 20);

    await expect(page.locator(SHEET), 'a 20 pixel nudge closed the sheet').not.toHaveClass(/hidden/);
  });
});
