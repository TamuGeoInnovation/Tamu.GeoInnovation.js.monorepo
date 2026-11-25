import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { ProbeLayer, waitForMapDrawn } from './map-probe';

/**
 * A link to one feature opens with that feature highlighted, drawn above every other layer (#1805).
 *
 * The highlight is a graphic on the selection layer. The map service adds the main map's layers while
 * an event map adds its own, both at once, so a layer could be added after the selection layer and draw
 * over the highlight: a Football Tailgating `?tent=` link opened with "Tent L1" in the sidebar and the
 * tent in its normal fill on some loads. Every layer loaded and nothing errored, so nothing else in the
 * suite could notice.
 *
 * Because the order came from load timing, one load proves little: each link is opened several times,
 * each in a fresh browser context, and the selection layer must hold the feature and be the top-most
 * layer every time. Basemap layers are left out, because a basemap's reference layers are listed
 * after the operational layers.
 */

const SELECTION_LAYER_ID = 'selection-layer';

/** Probe layer types a basemap is made of. */
const BASEMAP_TYPES = ['tile', 'vector-tile'];

/** Fresh loads per link. Before the fix, the selection layer was below other layers on 8 of 8 loads on dev. */
const LOADS = 3;

/** Links that select one feature, one per kind of link. */
const LINKS = ['/events/tailgating/map/d?tent=L1', '/events/tailgating/map/d?zone=AP-7'];

/** Opens `link` in this test's fresh browser context and returns its layers, top-most last, once a feature is selected and drawn. */
async function openSelected(page: Page, link: string): Promise<ProbeLayer[]> {
  await blockAnalytics(page);
  await page.goto(link, { waitUntil: 'domcontentloaded' });

  // Once it has finished drawing, so the order read is the one on screen.
  const layers = await waitForMapDrawn(page, `${link} never selected a feature`, {
    until: (drawn) => {
      const selection = drawn.find((l) => l.id === SELECTION_LAYER_ID);

      return Object.values(selection?.graphicTypes ?? {}).reduce((sum, count) => sum + count, 0) > 0;
    }
  });

  return layers.filter((l) => !BASEMAP_TYPES.includes(l.type));
}

for (const link of LINKS) {
  for (let load = 1; load <= LOADS; load++) {
    test(`${link} draws the highlight above every layer (load ${load} of ${LOADS})`, async ({ page }) => {
      const ids = (await openSelected(page, link)).map((l) => l.id);

      expect(ids.slice(ids.indexOf(SELECTION_LAYER_ID) + 1), `layers drawn over the highlight on ${link}`).toEqual([]);
    });
  }
}
