import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { Framing, waitForSettledFraming } from './framing';

/**
 * Switching a map between 2D and 3D keeps it where it was (#1724).
 *
 * On 12 October the main map moved about 2.4 km south when switched to 3D, and came back to 2D still
 * there: the 3D view was tilted without being told what to tilt around, and the 2D view then took
 * the tilted scene's position as its own. Nothing in the suite switched a map's perspective, so
 * nothing noticed.
 *
 * The check is on the place, not the picture: the centre of the view, read from the map probe, before
 * the switch, in 3D, and back in 2D.
 */

const MAP = '/map/d';
const TOGGLE = 'tamu-gisc-perspective-toggle';

/**
 * How far the centre may move. A tilted scene and a flat map do not agree to the metre on what is
 * "at the centre", so 3D is given some room; coming back to 2D is given almost none.
 */
const IN_3D_WITHIN_M = 150;
const BACK_IN_2D_WITHIN_M = 25;

/** Metres between two `[longitude, latitude]` centres; campus is small enough for a flat reckoning. */
function metresBetween(a: Framing['center'], b: Framing['center']): number {
  const north = (b[1] - a[1]) * 111_320;
  const east = (b[0] - a[0]) * 111_320 * Math.cos((a[1] * Math.PI) / 180);

  return Math.hypot(north, east);
}

test.describe('2D and 3D', () => {
  test('switching the main map to 3D and back keeps it where it was', async ({ page }) => {
    test.setTimeout(300_000);
    await blockAnalytics(page);
    await page.goto(MAP);

    const framed = async (what: string): Promise<Framing> => {
      const { framing } = await waitForSettledFraming(page, `${MAP} ${what}`);

      expect(framing, `${MAP} ${what} has no framing to read`).not.toBeNull();

      return framing as Framing;
    };

    const toggle = page.locator(TOGGLE).first();
    const flat = await framed('as loaded');

    await toggle.click();
    await expect(toggle, 'the toggle never said the map was in 3D').toHaveText('3D', { timeout: 60_000 });

    const tilted = await framed('in 3D');

    expect(
      metresBetween(flat.center, tilted.center),
      `switching to 3D moved the map from ${flat.center} to ${tilted.center}`
    ).toBeLessThan(IN_3D_WITHIN_M);

    await toggle.click();
    await expect(toggle, 'the toggle never said the map was back in 2D').toHaveText('2D', { timeout: 60_000 });

    const back = await framed('back in 2D');

    expect(
      metresBetween(flat.center, back.center),
      `coming back to 2D left the map at ${back.center}, not ${flat.center} where it started`
    ).toBeLessThan(BACK_IN_2D_WITHIN_M);
    expect(back.zoom, 'coming back to 2D changed the zoom').toBe(flat.zoom);

    // The map's buttons come back with it. Esri's zoom and locate components destroy themselves when
    // they leave the page, as the 2D view does while 3D is shown, so back in 2D they had gone (#1853).
    for (const control of ['arcgis-zoom', 'arcgis-track', 'tamu-gisc-map-compass']) {
      await expect(page.locator(`.esri-ui-top-left ${control}`), `back in 2D, ${control} is missing`).toBeVisible();
    }
  });

  /**
   * 3D is a Web Mercator globe whatever basemap the map was on, and its 3D buildings load (#1735).
   *
   * On development the campus basemap is a vector tile cache in EPSG:32139. A scene handed that map
   * came up in that reference: tilted, with every building flat, because the 3D Buildings layer
   * cannot be drawn in it. Choosing a raster basemap while in 3D then moved the scene to another
   * reference under its own camera and left a view of bands with no map in it.
   *
   * So for every campus basemap the panel offers here: choose it, go to 3D, and the view must be Web
   * Mercator with the 3D Buildings layer loaded, in the same place; choose the next one while still
   * in 3D and the same must hold; come back and the map is where it started, on the basemap chosen.
   */
  test('3D is a globe with its 3D buildings on every campus basemap offered here', async ({ page }) => {
    test.setTimeout(900_000);
    await blockAnalytics(page);
    await page.goto(`${MAP}/settings`);

    const framed = async (what: string): Promise<Framing> => {
      const { framing } = await waitForSettledFraming(page, `${MAP} ${what}`);

      expect(framing, `${MAP} ${what} has no framing to read`).not.toBeNull();

      return framing as Framing;
    };

    /** The view's spatial reference and whether the 3D Buildings layer has loaded, from the map probe. */
    const scene = () =>
      page.evaluate(async () => {
        const probe = (window as unknown as Record<string, { snapshot(): Promise<{ spatialReference: number | null; layers: Array<{ title: string; loaded: boolean }> }> }>)['__tamuGiscMapProbe'];
        const snapshot = await probe.snapshot();

        return {
          reference: snapshot.spatialReference,
          buildings: snapshot.layers.some((layer) => layer.title === '3D Buildings' && layer.loaded)
        };
      });

    const toggle = page.locator(TOGGLE).first();
    const flat = await framed('as loaded');
    const campus = (await page.locator('.basemap-title').allTextContents()).filter((title) => title.startsWith('Aggieland'));

    expect(campus.length, 'the basemap panel offers no campus basemap to check').toBeGreaterThan(0);

    const choose = async (title: string) => {
      await page.locator('.basemap', { hasText: title }).first().click();
      await expect(page.locator('.basemap.active .basemap-title'), `${title} was never marked as chosen`).toHaveText(title, {
        timeout: 60_000
      });
    };

    const expectAGlobe = async (what: string) => {
      await expect
        .poll(scene, { message: `${what}: 3D is not a Web Mercator globe with its 3D buildings`, timeout: 150_000, intervals: [2_000] })
        .toEqual({ reference: expect.any(Number), buildings: true });
      expect([102100, 3857], `${what}: the scene is in ${(await scene()).reference}`).toContain((await scene()).reference);
      expect(metresBetween(flat.center, (await framed(what)).center), `${what} moved the map`).toBeLessThan(IN_3D_WITHIN_M);
    };

    // 2D on the first campus basemap, into 3D.
    await choose(campus[0]);
    await toggle.click();
    await expect(toggle).toHaveText('3D', { timeout: 60_000 });
    await expectAGlobe(`3D from ${campus[0]}`);

    // Each of the others, chosen while still in 3D.
    for (const title of campus.slice(1)) {
      await page.locator('.basemap', { hasText: title }).first().click();
      await page.waitForTimeout(3_000);
      await expectAGlobe(`3D after choosing ${title}`);
    }

    // Back to 2D: the same place, at the same zoom, on the basemap chosen last.
    await toggle.click();
    await expect(toggle).toHaveText('2D', { timeout: 60_000 });

    const back = await framed('back in 2D');

    expect(metresBetween(flat.center, back.center), `coming back to 2D left the map at ${back.center}`).toBeLessThan(
      BACK_IN_2D_WITHIN_M
    );
    expect(back.zoom, 'coming back to 2D changed the zoom').toBe(flat.zoom);
    await expect(page.locator('.basemap.active .basemap-title')).toHaveText(campus[campus.length - 1], { timeout: 60_000 });
  });

  /**
   * In 3D, a basemap the scene cannot draw is shown as unavailable (#1740).
   *
   * The campus vector tiles are in EPSG:32139 and a scene is a Web Mercator globe, so the scene draws
   * the raster campus basemap in their place. The panel used to go on offering the vector basemap in
   * 3D, where choosing it did nothing a visitor could see, and it simply looked broken: it could be
   * chosen in 2D, and not in 3D, with nothing to say why.
   *
   * So while the map is in 3D the panel marks the basemap that is actually on screen, shows the one
   * the scene cannot draw as unavailable and does not act on a click, and gives it back in 2D.
   */
  test('in 3D, a campus basemap the scene cannot draw is shown as unavailable, and comes back in 2D', async ({ page }) => {
    test.setTimeout(600_000);
    await blockAnalytics(page);
    await page.goto(`${MAP}/settings`);
    await waitForSettledFraming(page, `${MAP} as loaded`);

    const reference = () =>
      page.evaluate(async () => {
        const probe = (window as unknown as Record<string, { snapshot(): Promise<{ spatialReference: number | null }> }>)['__tamuGiscMapProbe'];

        return (await probe.snapshot()).spatialReference;
      });

    const flatReference = await reference();

    // Where the map opens on a Web Mercator basemap, as production does, every campus basemap can be
    // drawn in 3D and there is nothing to mark.
    test.skip([102100, 3857].includes(flatReference as number), 'the basemap this environment opens on can be drawn in 3D');

    const toggle = page.locator(TOGGLE).first();
    const chosen = page.locator('.basemap.active .basemap-title');
    const opensOn = ((await chosen.textContent()) ?? '').trim();
    const row = page.locator('.basemap', { hasText: opensOn }).first();

    expect(opensOn, 'the panel marks no basemap as chosen').not.toBe('');
    await expect(row, `${opensOn} is shown as unavailable in 2D`).not.toHaveClass(/unavailable/);

    await toggle.click();
    await expect(toggle).toHaveText('3D', { timeout: 60_000 });

    await expect(row, `${opensOn} cannot be drawn in 3D and is not shown as unavailable`).toHaveClass(/unavailable/, {
      timeout: 60_000
    });
    await expect(chosen, 'in 3D the panel still marks a basemap the scene is not drawing').not.toContainText(opensOn, {
      timeout: 60_000
    });

    const standIn = ((await chosen.textContent()) ?? '').trim();

    // Clicking it does nothing: the panel goes on marking what is on screen, and the scene stays a globe.
    await row.click({ force: true });
    await page.waitForTimeout(3_000);
    await expect(chosen).toContainText(standIn);
    expect([102100, 3857], 'clicking it moved the scene out of Web Mercator').toContain(await reference());

    await toggle.click();
    await expect(toggle).toHaveText('2D', { timeout: 60_000 });
    await expect(chosen, `2D did not come back on ${opensOn}`).toContainText(opensOn, { timeout: 60_000 });
    await expect(row).not.toHaveClass(/unavailable/);
    expect(await reference(), '2D came back in another spatial reference').toBe(flatReference);
  });
});
