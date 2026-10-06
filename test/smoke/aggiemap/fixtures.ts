import { test as base, Route } from '@playwright/test';

/**
 * The suite's `test`, which every spec imports instead of Playwright's: the same, plus the ArcGIS SDK
 * served from a cache shared by every test in a worker (#1426).
 *
 * Each test still gets a fresh browser context, so nothing the app stores - cookies, local storage, a
 * basemap preference - leaks from one test into the next. Only the download of the SDK is shared. Without
 * this, every one of the ~770 page loads fetched the whole runtime from `js.arcgis.com` again, because a
 * fresh context starts with an empty HTTP cache.
 *
 * The page still requests the same URLs, so what it asks for is unchanged: `esri-runtime.spec.ts` still
 * reads the requested version from the script tag, and the version the kernel reports is the one that
 * was fetched. A file is cached only once it has been fetched successfully, so a failing CDN still fails
 * the test that met it, and is fetched again by the next.
 *
 * Workers are separate processes, so each keeps its own cache; it lives as long as the worker does.
 */

const SDK = 'https://js.arcgis.com/**';

interface Cached {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

const cache = new Map<string, Cached>();

/** Headers that describe the bytes on the wire, which no longer apply once the body has been decoded. */
const TRANSFER_HEADERS = new Set(['content-encoding', 'content-length', 'transfer-encoding']);

async function serveSdk(route: Route): Promise<void> {
  const request = route.request();
  const url = request.url();

  if (request.method() !== 'GET') {
    return route.continue();
  }

  const hit = cache.get(url);

  if (hit) {
    return route.fulfill(hit).catch(() => undefined);
  }

  let fetched: Cached;

  try {
    const response = await route.fetch();

    fetched = {
      status: response.status(),
      headers: Object.fromEntries(
        Object.entries(response.headers()).filter(([name]) => !TRANSFER_HEADERS.has(name.toLowerCase()))
      ),
      body: await response.body()
    };
  } catch {
    // Either the CDN could not be reached, which the page now sees as a failed request and reports
    // like any other, or the test finished while this download was still under way (the runtime
    // version check stops as soon as the script tag appears), which leaves nobody to answer.
    return route.abort().catch(() => undefined);
  }

  if (fetched.status === 200) {
    cache.set(url, fetched);
  }

  return route.fulfill(fetched).catch(() => undefined);
}

export const test = base.extend<{ esriSdkCache: void }>({
  esriSdkCache: [
    async ({ context }, use) => {
      await context.route(SDK, serveSdk);
      await use();
    },
    { auto: true }
  ]
});

export { expect } from '@playwright/test';
