import { ESRI_RUNTIME_VERSION } from '../../../libs/maps/esri/src/lib/esri-runtime';
import { expect, test } from './fixtures';

/**
 * The deployed site loads the ArcGIS runtime this workspace pins (#1219).
 *
 * The API comes from Esri's CDN at runtime, so the version a visitor gets is decided by what
 * `esri-loader` was told, not by anything in the bundle. Until #1219 nothing told it, and every map
 * ran 4.23 - a 2022 release - because that is `esri-loader`'s built-in default.
 *
 * Asserted against the running page rather than the source, because that is the only place the answer
 * is real. The pin is applied as a side effect of importing `@tamu-gisc/maps/esri`; a page that
 * reached `loadModules` by some other path would load the default instead, and the source cannot show
 * that - this can.
 */
/** The environment under test, as every other helper here resolves it. */
const BASE_URL = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');

test.describe('the ArcGIS runtime', () => {
  test(`is the pinned ${ESRI_RUNTIME_VERSION}, not esri-loader's default`, async ({ page }) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });

    // The script tag esri-loader injects names the version in its URL, which is readable as soon as
    // it is added - well before the modules finish loading.
    const source = await page
      .locator('script[src*="js.arcgis.com"]')
      .first()
      .getAttribute('src', { timeout: 60_000 });

    expect(source, 'no ArcGIS script was requested at all').toBeTruthy();
    expect(source, `the page loaded a different ArcGIS runtime: ${source}`).toContain(
      `/${ESRI_RUNTIME_VERSION}/`
    );
  });

  test(`reports ${ESRI_RUNTIME_VERSION} from the loaded kernel`, async ({ page }) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });

    // What the runtime says about itself once it has loaded, which is the version actually in use
    // rather than the one that was requested.
    const version = await page.waitForFunction(
      () => {
        const amd = (window as unknown as { require?: (m: string[], cb: (k: { version: string }) => void) => void })
          .require;

        if (typeof amd !== 'function') {
          return null;
        }

        return new Promise<string>((resolve) => amd(['esri/kernel'], (kernel) => resolve(kernel.version)));
      },
      undefined,
      { timeout: 90_000 }
    );

    expect(await version.jsonValue()).toBe(ESRI_RUNTIME_VERSION);
  });
});
