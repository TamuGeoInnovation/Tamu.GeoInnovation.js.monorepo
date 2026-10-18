import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * Choosing a basemap in the settings panel changes the map, and the panel marks the one chosen (#1672).
 *
 * The panel lists the gallery's basemaps and marks the one the view is showing, which it learns from
 * the view after the basemap has loaded, outside Angular. A panel that stops repainting when that
 * arrives, which is how OnPush fails on a component whose data comes from a subscription (#1669), keeps
 * marking the basemap it opened on while the map underneath has changed, or the map keeps its basemap
 * while the panel says otherwise. Both pass every check made on a page as it loads.
 *
 * So a basemap is chosen, then another, then the one the map opened on, and after each the panel must
 * mark it and the view must be drawing its layers, read from the map probe: each choice's layers must
 * differ from the last, and coming back must bring back the layers the map opened with.
 *
 * Two of ArcGIS's own basemaps, which every environment's gallery offers. The campus basemaps differ by
 * environment, so the map's own is reached as the one marked when it opened.
 */

const MAP = '/map/d/settings';
const CHOICES = ['Streets', 'Light Gray Canvas'];

/** Probe layer types a basemap is made of. */
const BASEMAP_TYPES = ['tile', 'vector-tile'];

/** The titles of the basemap layers the view is drawing, once the map is ready; null before. */
async function basemapLayers(page: Page): Promise<string | null> {
  return await page.evaluate(async (types) => {
    const probe = (
      window as unknown as Record<
        string,
        { ready?: boolean; snapshot(): Promise<{ layers: Array<{ title: string; type: string }> }> } | undefined
      >
    )['__tamuGiscMapProbe'];

    if (probe?.ready !== true) {
      return null;
    }

    return (await probe.snapshot()).layers
      .filter((layer) => types.includes(layer.type))
      .map((layer) => layer.title)
      .join(', ');
  }, BASEMAP_TYPES);
}

test.describe('basemap gallery', () => {
  test('choosing a basemap changes the map, and the panel marks it', async ({ page }) => {
    test.setTimeout(240_000);
    await blockAnalytics(page);
    await page.goto(MAP);

    const marked = page.locator('.basemap.active .basemap-title');

    await expect
      .poll(() => basemapLayers(page), { message: `${MAP} never finished loading`, timeout: 90_000, intervals: [1_000] })
      .not.toBeNull();

    const openedOn = ((await marked.textContent()) ?? '').trim();
    const openedWith = await basemapLayers(page);

    expect(openedOn, `${MAP} marks no basemap as the one showing`).not.toBe('');

    let drawing = openedWith;

    for (const title of [...CHOICES, openedOn]) {
      await page
        .locator('.basemap', { has: page.locator('.basemap-title', { hasText: title }) })
        .first()
        .click();

      await expect(marked, `choosing ${title} did not mark it as the one showing`).toHaveText(title, { timeout: 60_000 });
      const before = drawing;

      await expect
        .poll(
          async () => {
            drawing = await basemapLayers(page);

            return drawing !== null && drawing !== '' && drawing !== before;
          },
          { message: `choosing ${title} did not change the map's basemap from ${before}`, timeout: 60_000 }
        )
        .toBe(true);
    }

    expect(drawing, `coming back to ${openedOn} did not bring back the basemap the map opened with`).toBe(openedWith);
  });
});
