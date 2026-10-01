import { Locator, Page } from '@playwright/test';
import { PNG } from 'pngjs';

/**
 * Did the map actually draw anything?
 *
 * Every other assertion in this suite asks the application about itself, and a map can answer all of
 * them correctly while showing the user a blank rectangle. That is #1240 - every event map drew
 * nothing while the suite reported them healthy - and it is why #1241's drawability check was added.
 *
 * That check is still not sufficient. It asks whether each layer *could* be drawn in the view's
 * spatial reference, which is a different question from whether anything *was*. A map whose layers
 * are all drawable can still paint nothing. The only measurement that answers the user's question is
 * the picture.
 */

/** The share of sampled pixels taken by the single most common colour. */
export interface Dominance {
  share: number;
  colour: string;
  colours: number;
}

/**
 * Every eleventh pixel. Enough to tell "one flat colour" from "a map", and cheap enough to run on
 * every map in the suite without noticeably lengthening a run.
 */
const SAMPLE_STRIDE = 4 * 11;

export function dominance(png: Buffer): Dominance {
  const image = PNG.sync.read(png);
  const counts = new Map<number, number>();
  let sampled = 0;

  for (let i = 0; i < image.data.length - 4; i += SAMPLE_STRIDE) {
    const key = (image.data[i] << 16) | (image.data[i + 1] << 8) | image.data[i + 2];

    counts.set(key, (counts.get(key) ?? 0) + 1);
    sampled++;
  }

  let top = 0;
  let topKey = 0;

  for (const [key, count] of counts) {
    if (count > top) {
      top = count;
      topKey = key;
    }
  }

  return {
    share: sampled === 0 ? 1 : top / sampled,
    colour: '#' + topKey.toString(16).padStart(6, '0'),
    colours: counts.size
  };
}

/**
 * The share above which a canvas counts as blank.
 *
 * Measured against both deployed environments on 1 October 2026, over the map canvas alone with the
 * side panel excluded:
 *
 * | Map | Dominant share |
 * | --- | --- |
 * | `/map` | 0.47 |
 * | `/campus/galveston` | 0.42 |
 * | `/campus/mcallen` | 0.36 |
 * | `/campus/dc-bush-school` | 0.33 |
 * | `/events/150th-kickoff` | 0.26 |
 *
 * Healthy maps sit between 0.26 and 0.47; a blank one is effectively 1. The threshold is set well
 * clear of the healthy range rather than snugly above it, because a map legitimately framed over
 * water or open ground is flatter than one over campus, and a check that cries wolf gets disabled.
 */
export const BLANK_ABOVE = 0.85;

/**
 * How long a map gets to paint something.
 *
 * Measured the same day: maps painted between 6 and 13 seconds on both environments, development
 * consistently 2-3 seconds behind production. Thirty seconds is comfortably clear of that and still
 * fails in reasonable time.
 *
 * Deliberately not keyed to the probe's `ready`, which was observed never to become true within 80
 * seconds on most maps, on both environments. See #1259.
 */
export const PAINT_TIMEOUT_MS = 30_000;

export interface PaintResult extends Dominance {
  paintedAfterMs: number | null;
}

/**
 * Polls the map canvas until it is no longer one flat colour.
 *
 * Returns the last measurement either way, so a failure can say what it saw rather than only that it
 * waited.
 */
export async function waitForPaint(page: Page, timeoutMs = PAINT_TIMEOUT_MS): Promise<PaintResult> {
  const startedAt = Date.now();
  let last: Dominance = { share: 1, colour: '#000000', colours: 0 };

  while (Date.now() - startedAt < timeoutMs) {
    const canvas: Locator = page.locator('.esri-view-surface, canvas').first();

    if ((await canvas.count()) > 0) {
      try {
        last = dominance(await canvas.screenshot({ type: 'png' }));

        if (last.share < BLANK_ABOVE) {
          return { ...last, paintedAfterMs: Date.now() - startedAt };
        }
      } catch {
        // The canvas can be detached mid-screenshot while the view rebuilds; try again.
      }
    }

    await page.waitForTimeout(1_000);
  }

  return { ...last, paintedAfterMs: null };
}
