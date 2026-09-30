import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sections of the app that are not ready for production (#1090).
 *
 * `TestingService` treats a host containing `dev` or `localhost` as development, so the same build
 * renders two variants: one with these sections and one without. Nothing asserted that the second
 * variant actually hid them, and the Bus Routes tab was shipping to production as a result - a button
 * that opened a panel apologising for being unavailable.
 *
 * Listed by the title the sidebar tab renders, because that is what a visitor sees and what a template
 * change is most likely to get wrong. When a section goes to production, take it out of this list; the
 * checks then require it to be present everywhere instead.
 */
export const DEVELOPMENT_ONLY_SECTIONS = ['Directions', 'Bus Routes', 'Experiments'];

/** Whether the environment under test renders the development variant. */
export function developmentSectionsVisible(): boolean {
  const baseUrl = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');
  const environments: Record<string, { baseUrl: string; developmentSectionsVisible?: boolean }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === baseUrl);

  if (match?.developmentSectionsVisible === undefined) {
    throw new Error(`environments.json does not say whether development-only sections are visible on ${baseUrl}`);
  }

  return match.developmentSectionsVisible;
}

/** How many sidebar tabs with this title the page is rendering. A tab renders its title as `title`. */
export async function sidebarTabs(page: Page, title: string): Promise<number> {
  return page.locator(`tamu-gisc-sidebar-tab [title="${title}"]`).count();
}
