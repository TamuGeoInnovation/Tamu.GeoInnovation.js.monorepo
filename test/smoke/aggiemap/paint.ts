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
 * And against the campus maps while they were broken, which is the other end a threshold needs:
 *
 * | State | Dominant share |
 * | --- | --- |
 * | Healthy map | 0.26 to 0.47 |
 * | Blank campus map, buildings drawing but no basemap | 0.815 to 0.82 |
 * | Nothing drawn at all | 0.955 and up |
 *
 * 0.65 sits roughly midway, about 0.17 clear of each. Both ends were measured rather than assumed:
 * an earlier value of 0.85, set from the healthy range alone, let a blank campus map through at
 * 0.816 - a threshold chosen from one side only is a guess about the other.
 */
export const BLANK_ABOVE = 0.65;

/**
 * How long a map gets to paint something.
 *
 * Ninety seconds, which is not the time a healthy map takes - it is the time one is allowed before
 * being called broken, and those are different numbers.
 *
 * The first value here was thirty seconds, from maps that painted in 6 to 13 seconds when measured on
 * one warm afternoon. That is the best case. CLAUDE.md has said all along, under "Things that look
 * broken but are not", that a canvas blank for 20 to 40 seconds is Esri still drawing; on top of that
 * the stability readings below need about six more, and a server pool that has not warmed up is
 * slower again. Thirty seconds was therefore shorter than the documented normal case, and on
 * 1 October it failed four maps that had drawn - `/map` among them, reported blank while its canvas
 * measured 0.484 against a 0.65 threshold. See #1285.
 *
 * Deliberately not keyed to the probe's `ready`, which was observed never to become true within 80
 * seconds on most maps, on both environments. See #1259 and #1267.
 */
export const PAINT_TIMEOUT_MS = 90_000;

export interface PaintResult extends Dominance {
  paintedAfterMs: number | null;
  /**
   * Consecutive good readings in hand when the clock ran out, so a caller can tell the two failures
   * apart: a canvas that stayed blank is a broken map, and one that kept reading as drawn without
   * settling is a slow one. Both used to arrive as `paintedAfterMs: null` and be reported as "never
   * painted", which was true of only the first (#1285).
   */
  steadyReadings: number;
  /** How many readings were taken in total, so a timeout can say whether it sampled at all. */
  readings: number;
}

/**
 * Consecutive good readings required before a map counts as drawn.
 *
 * One is not enough. A campus map carrying a saved basemap preference paints with its default
 * basemap, then switches to the chosen one and goes blank - so a check that returns on the first
 * non-blank frame reports a map that ends up empty as healthy. That is exactly how this check passed
 * `/campus/mcallen` on development while the map was unusable, before this was added.
 */
const STABLE_READINGS = 3;

/** Gap between those readings. Three of them plus the gaps puts the earliest pass around 10s. */
const READING_GAP_MS = 2_000;

/**
 * Polls the map canvas until it has been something other than one flat colour, consistently.
 *
 * Returns the last measurement either way, so a failure can say what it saw rather than only that it
 * waited. A run of good readings is reset by any blank one, so a map that paints and then empties is
 * reported as never having painted - which, for the person looking at it, is the truth.
 */
export async function waitForPaint(page: Page, timeoutMs = PAINT_TIMEOUT_MS): Promise<PaintResult> {
  const startedAt = Date.now();
  let last: Dominance = { share: 1, colour: '#000000', colours: 0 };
  let consecutive = 0;
  let readings = 0;

  while (Date.now() - startedAt < timeoutMs) {
    // The map surface specifically. A bare `canvas` can match something else on the page, and the
    // Esri surface is the thing the visitor is looking at.
    const canvas: Locator = page.locator('.esri-view-surface').first();
    const target: Locator = (await canvas.count()) > 0 ? canvas : page.locator('canvas').first();

    if ((await target.count()) > 0) {
      try {
        last = dominance(await target.screenshot({ type: 'png' }));
          readings += 1;
        consecutive = last.share < BLANK_ABOVE ? consecutive + 1 : 0;

        if (consecutive >= STABLE_READINGS) {
            return { ...last, paintedAfterMs: Date.now() - startedAt, steadyReadings: consecutive, readings };
        }
      } catch {
        // The canvas can be detached mid-screenshot while the view rebuilds; try again.
        consecutive = 0;
      }
    }

    await page.waitForTimeout(READING_GAP_MS);
  }

  return { ...last, paintedAfterMs: null, steadyReadings: consecutive, readings };
}

/**
 * Says what a result means, so a failure message matches what was measured.
 *
 * The old message said "never painted" for every timeout, including ones whose own quoted number was
 * below the blank threshold - telling the reader the map was blank while printing the evidence that
 * it was not (#1285).
 */
export function describePaint(mapPath: string, paint: PaintResult, timeoutMs = PAINT_TIMEOUT_MS): string {
  const seconds = Math.round(timeoutMs / 1000);
  const canvas = `the canvas is ${paint.share.toFixed(3)} ${paint.colour}`;

  if (paint.readings === 0) {
    return `${mapPath} never produced a canvas to measure within ${seconds}s`;
  }

  if (paint.share >= BLANK_ABOVE) {
    return `${mapPath} stayed blank for ${seconds}s: ${canvas}, and a map that has drawn is below ${BLANK_ABOVE}`;
  }

  return (
    `${mapPath} drew but never settled within ${seconds}s: ${canvas}, which is below ${BLANK_ABOVE}, but it held ` +
    `that for only ${paint.steadyReadings} of the ${STABLE_READINGS} consecutive readings required. A map that ` +
    `paints and then empties looks like this, and so does one that is simply slow`
  );
}
