import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Whether directions should be offered in the environment under test (#1003).
 *
 * Routing is unpublished, so directions are development-only, like other features not ready for
 * production: the Directions tab and every "Directions To Here" button are hidden on production and
 * shown on dev and localhost. environments.json says which, per environment. When routing returns and
 * directions go back to production, set `directionsAvailable` to true there, and these checks then
 * require the entry points to be present instead.
 */
export function directionsAvailable(): boolean {
  const baseUrl = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');
  const environments: Record<string, { baseUrl: string; directionsAvailable?: boolean }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === baseUrl);

  if (match?.directionsAvailable === undefined) {
    throw new Error(`environments.json does not say whether directions are available on ${baseUrl}`);
  }

  return match.directionsAvailable;
}

/** The Directions tabs and "Directions To Here" buttons on the page right now. */
export async function directionsEntryPoints(page: Page): Promise<{ tabs: number; buttons: number }> {
  return {
    // A sidebar tab renders its title as the `title` attribute of its button.
    tabs: await page.locator('tamu-gisc-sidebar-tab [title="Directions"]').count(),
    buttons: await page.getByText('Directions To Here', { exact: true }).count()
  };
}
