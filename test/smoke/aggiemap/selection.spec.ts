import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

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

const PROBE_GLOBAL = '__tamuGiscMapProbe';

const SELECTION_LAYER_ID = 'selection-layer';

/** Probe layer types a basemap is made of. */
const BASEMAP_TYPES = ['tile', 'vector-tile'];

/** Fresh loads per link. Before the fix, the selection layer was below other layers on 8 of 8 loads on dev. */
const LOADS = 3;

/** Links that select one feature, one per kind of link. */
const LINKS = ['/events/tailgating/map/d?tent=L1', '/events/tailgating/map/d?zone=AP-7'];

interface ProbeLayer {
  id: string;
  type: string;
  graphicTypes: Record<string, number> | null;
}

/** Opens `link` in this test's fresh browser context and returns its layers, top-most last, once a feature is selected and drawn. */
async function openSelected(page: Page, link: string): Promise<ProbeLayer[]> {
  await blockAnalytics(page);
  await page.goto(link, { waitUntil: 'domcontentloaded' });

  let layers: ProbeLayer[] = [];

  await expect
    .poll(
      async () => {
        layers = await page.evaluate(async (name) => {
          const probe = (
            window as unknown as Record<
              string,
              { ready?: boolean; drawing?: boolean; snapshot: () => Promise<{ layers: ProbeLayer[] }> }
            >
          )[name];

          // Once it has finished drawing, so the order read is the one on screen.
          return probe?.ready === true && probe.drawing === false ? (await probe.snapshot()).layers : [];
        }, PROBE_GLOBAL);

        const selection = layers.find((l) => l.id === SELECTION_LAYER_ID);

        return Object.values(selection?.graphicTypes ?? {}).reduce((sum, count) => sum + count, 0);
      },
      { message: `${link} never selected a feature`, timeout: 90_000, intervals: [1_000] }
    )
    .toBeGreaterThan(0);

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
