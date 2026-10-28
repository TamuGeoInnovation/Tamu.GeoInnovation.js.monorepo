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

/**
 * The campus vector basemap's second layer, the hatch over the buildings under construction. It is a feature layer, so
 * the types above miss it, and it is what a copy of the basemap made without its second layer loses (#2536).
 */
const CONSTRUCTION_HATCH = 'Buildings under construction';

/** The titles of the basemap layers the view is drawing, once the map is ready; null before. */
async function basemapLayers(page: Page): Promise<string | null> {
  return await page.evaluate(async ([types, hatch]) => {
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
      .filter((layer) => types.includes(layer.type) || layer.title === hatch)
      .map((layer) => layer.title)
      .join(', ');
  }, [BASEMAP_TYPES, CONSTRUCTION_HATCH] as const);
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

  /**
   * Aerial Imagery asks Nearmap for its latest imagery as one short GET, and is answered with an image
   * (#1997).
   *
   * Left to ArcGIS, the layer named every capture in the area, 19 on campus. That took the request past
   * ArcGIS's 2,000-character limit, so it was sent as a POST, and Nearmap answers a POST with an empty
   * XML document on some requests: the map stayed white, 1 load in 3 on production. Whether the map
   * drew depended on that answer, so the request itself is what is checked, not the picture: each image
   * Nearmap is asked for while the latest imagery opens must be a GET for one layer, answered with an image.
   */
  test('Aerial Imagery asks for its latest imagery as one GET, and gets an image', async ({ page }) => {
    test.setTimeout(240_000);
    await blockAnalytics(page);

    const requests: Array<{ method: string; layers: number; answer: Promise<string> }> = [];

    page.on('request', (request) => {
      const query = request.method() === 'POST' ? (request.postData() ?? '') : new URL(request.url()).search;
      const params = new URLSearchParams(query);

      if (!request.url().includes('api.nearmap.com') || !/^getmap$/i.test(params.get('request') ?? params.get('REQUEST') ?? '')) {
        return;
      }

      const layers = (params.get('layers') ?? params.get('LAYERS') ?? '').split(',').filter(Boolean).length;
      const answer = request
        .response()
        .then((response) => response?.headers()['content-type'] ?? 'no answer')
        .catch(() => 'no answer');

      requests.push({ method: request.method(), layers, answer });
    });

    await page.goto(MAP);

    await expect
      .poll(() => basemapLayers(page), { message: `${MAP} never finished loading`, timeout: 90_000, intervals: [1_000] })
      .not.toBeNull();

    await page.locator('.basemap', { has: page.locator('.basemap-title', { hasText: 'Aerial Imagery' }) }).first().click();

    await expect
      .poll(() => requests.length, { message: 'choosing Aerial Imagery asked Nearmap for no image', timeout: 60_000 })
      .toBeGreaterThan(0);

    for (const { method, layers, answer } of requests) {
      expect(`${method} for ${layers} layer(s)`, 'Nearmap must be asked for one layer, by GET').toBe('GET for 1 layer(s)');
      expect(await answer, 'Nearmap must answer with an image').toMatch(/^image\//);
    }

    // The panel's spinner waits for the basemap to draw. It used to wait for the whole map, and on a
    // development host a feature layer could stay updating after the switch, so it never stopped (#1997).
    await expect(
      page.locator('.basemap', { has: page.locator('.basemap-title', { hasText: 'Aerial Imagery' }) }).locator('.spinning-loader'),
      'the Aerial Imagery spinner should stop once the imagery has drawn'
    ).toHaveCount(0, { timeout: 60_000 });
  });
  /**
   * The Aerial Imagery date slider is offered on every environment (#2089).
   *
   * It was development-only from the day it was built, while one question was open (#1541): whether an
   * older capture is billed differently from the current one. That is settled, so it is now everywhere,
   * and `DEVELOPMENT_ONLY_CONTROLS` no longer carries it.
   *
   * Opened by `?imagery=<date>` rather than through the basemap gallery, because that is how somebody
   * meets it without looking for it: a link shared from another map. A date with no capture snaps to
   * the nearest, so this does not depend on Nearmap's exact list staying the same.
   *
   * Not waiting for the map to finish painting: the slider is drawn as soon as the captures are read
   * from the WMS capabilities, which is well before the imagery has drawn.
   */
  test('the Aerial Imagery date slider is offered, on any environment', async ({ page }) => {
    test.setTimeout(180_000);
    await blockAnalytics(page);

    await page.goto('/map/d?imagery=2020-10-06');

    await expect(
      page.locator('.nearmap-date-slider'),
      'the Aerial Imagery date slider should be offered here: it went to production in #2089'
    ).toBeVisible({ timeout: 90_000 });
  });
});
