import { expect, test } from '@playwright/test';

import { blockAnalytics } from './analytics';
import { DEVELOPMENT_ONLY_SECTIONS, developmentSectionsVisible, sidebarTabs } from './development-only';

/**
 * Development-only sections stay off production (#1090).
 *
 * Checked both ways from `developmentSectionsVisible` in environments.json, so the gate is proven to
 * hide them where it should and to keep them where it should. A check that only ran on production
 * would pass just as well if the section had been deleted outright.
 */

const VISIBLE = developmentSectionsVisible();
const PROBE_GLOBAL = '__tamuGiscMapProbe';

test.describe(`development-only sections ${VISIBLE ? 'are offered here' : 'stay off this environment'}`, () => {
  for (const section of DEVELOPMENT_ONLY_SECTIONS) {
    test(`the ${section} tab ${VISIBLE ? 'is offered' : 'is not offered'}`, async ({ page }) => {
      await blockAnalytics(page);
      await page.goto('/map');

      await expect
        .poll(
          async () =>
            await page.evaluate(
              (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
              PROBE_GLOBAL
            ),
          { message: 'the main map never finished loading', timeout: 90_000, intervals: [1_000] }
        )
        .toBe(true);

      const count = await sidebarTabs(page, section);

      expect(
        count,
        VISIBLE
          ? `the ${section} tab should be offered here`
          : `the ${section} tab is offered on an environment that should not have it`
      ).toBe(VISIBLE ? 1 : 0);
    });
  }
});
