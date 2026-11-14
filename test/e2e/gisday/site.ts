import { Page } from '@playwright/test';

/**
 * Serves the app as another organization's site: a key of `GISDAY_SITES` in
 * `libs/gisday/common/src/lib/sites.ts`, such as `ucgis` or `tamu` (#1835).
 *
 * A deployed container replaces `___ANGULAR_SITE___` in the app's scripts when it starts. This does the same
 * to every script the dev server sends, so what runs here is what that deployment runs. Call it before the
 * first `goto`.
 */
export async function asSite(page: Page, site: string) {
  await page.route(/\.js(\?.*)?$/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/___ANGULAR_SITE___/g, site);
    await route.fulfill({ response, body });
  });
}
