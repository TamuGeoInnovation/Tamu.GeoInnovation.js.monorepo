import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { PROBE_GLOBAL, ProbeLayer, waitForMapDrawn } from './map-probe';

/**
 * A map that never finishes drawing says why (#3369).
 *
 * `waitForMapDrawn` timed out with only its caller's message, so "not ready", "still drawing", "the layers were not the
 * ones asked for" and "this build has no probe at all" all read the same: Muster failed three times as a map that never
 * finished drawing both layers, when its screenshot showed both drawn. These pages hold a stand-in probe, or none, so
 * each case is certain and needs no deployed map. Each wait is a few seconds; the real ones keep their own timeouts.
 */

const LAYER = (id: string): ProbeLayer => ({
  id,
  title: id,
  type: 'feature',
  visible: true,
  loaded: true,
  error: null,
  featureCount: 1,
  graphicTypes: null
});

/** A blank page with a stand-in probe, or none. */
async function pageWith(page: Page, probe: { ready: boolean; drawing: boolean; layers: ProbeLayer[] } | null) {
  await page.setContent('<html><body>no map here</body></html>');

  if (probe) {
    await page.evaluate(
      ({ name, probe }) => {
        (window as unknown as Record<string, unknown>)[name] = {
          ready: probe.ready,
          drawing: probe.drawing,
          snapshot: async () => ({ layers: probe.layers })
        };
      },
      { name: PROBE_GLOBAL, probe }
    );
  }
}

/** The message a wait that never finishes throws. */
async function timeoutMessage(wait: Promise<unknown>): Promise<string> {
  return wait.then(
    () => 'it finished',
    (error: Error) => error.message
  );
}

test.describe('a drawing timeout names what was unmet (#3369)', () => {
  test('a page with no probe says so, which means the build is older than the probe', async ({ page }) => {
    await pageWith(page, null);

    const message = await timeoutMessage(waitForMapDrawn(page, 'the test map never finished drawing', { timeout: 3_000 }));

    expect(message).toContain('the test map never finished drawing');
    expect(message).toContain('the page had no map probe');
  });

  test('a map drawn, but without the layers asked for, says which layers it had', async ({ page }) => {
    await pageWith(page, { ready: true, drawing: false, layers: [LAYER('muster-bonfire'), LAYER('muster-reflection')] });

    const message = await timeoutMessage(
      waitForMapDrawn(page, 'the test map never finished drawing both layers', {
        timeout: 3_000,
        until: (layers) => layers.length === 3
      })
    );

    expect(message).toContain('the test map never finished drawing both layers');
    expect(message).toContain('the map had finished drawing, but its layers were not the ones asked for');
    expect(message).toContain('2 (muster-bonfire, muster-reflection)');
  });

  test('a map not ready says so', async ({ page }) => {
    await pageWith(page, { ready: false, drawing: false, layers: [] });

    expect(await timeoutMessage(waitForMapDrawn(page, 'never finished', { timeout: 3_000 }))).toContain('was not ready');
  });

  test('a map ready but still drawing says so', async ({ page }) => {
    await pageWith(page, { ready: true, drawing: true, layers: [] });

    expect(await timeoutMessage(waitForMapDrawn(page, 'never finished', { timeout: 3_000 }))).toContain(
      'ready but still drawing'
    );
  });

  test('a map drawn finishes as before', async ({ page }) => {
    await pageWith(page, { ready: true, drawing: false, layers: [LAYER('a')] });

    expect(
      await waitForMapDrawn(page, 'never finished', { timeout: 3_000, until: (layers) => layers.length === 1 })
    ).toHaveLength(1);
  });
});
