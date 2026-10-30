import { ESRI_RUNTIME_VERSION } from '../../../libs/maps/esri/src/lib/esri-runtime';
import { expect, test } from './fixtures';
import { smokeBaseUrl } from './gis-hosts';

/**
 * The deployed site runs the ArcGIS SDK this workspace pins (#1219, #1844).
 *
 * Until #1219 every map ran 4.23, `esri-loader`'s built-in default, because nothing told it otherwise.
 * Since #1844 the SDK is `@arcgis/core`, bundled at the version in `package.json`, and what still comes
 * from Esri's CDN - workers, fonts, translations, the widget stylesheet - is requested from a path that
 * names the version: `https://js.arcgis.com/<version>/@arcgis/core/assets/...`. A build carrying another
 * version requests another path.
 *
 * A build from before #1844 loaded the AMD runtime from `https://js.arcgis.com/<version>/init.js`, which
 * names the version the same way, so this passes against either until production carries #1844.
 */
/** The environment under test, as every other helper here resolves it. */
const BASE_URL = smokeBaseUrl();

test.describe('the ArcGIS runtime', () => {
  test(`is the pinned ${ESRI_RUNTIME_VERSION}`, async ({ page }) => {
    const requested = page.waitForRequest(
      (request) => request.url().startsWith(`https://js.arcgis.com/${ESRI_RUNTIME_VERSION}/`),
      { timeout: 90_000 }
    );

    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });

    expect((await requested).url(), `no ArcGIS ${ESRI_RUNTIME_VERSION} file was requested`).toBeTruthy();
  });
});
