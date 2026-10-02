import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

import { BLANK_ABOVE, dominance, describePaint, PAINT_TIMEOUT_MS, waitForPaint } from './paint';

/**
 * The blank-canvas detector, proved against images this file builds.
 *
 * A check that silently stops detecting reads as a pass, which is worse than no check. These need no
 * browser and no environment, so they run everywhere the suite does and fail loudly if the measure
 * is ever changed in a way that stops separating a map from a blank rectangle.
 */

function solid(width: number, height: number, rgb: [number, number, number]): Buffer {
  const png = new PNG({ width, height });

  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = rgb[0];
    png.data[i + 1] = rgb[1];
    png.data[i + 2] = rgb[2];
    png.data[i + 3] = 255;
  }

  return PNG.sync.write(png);
}

/** A deterministic spread of colours, standing in for a drawn map. */
function varied(width: number, height: number): Buffer {
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) << 2;

      png.data[i] = (x * 7) % 256;
      png.data[i + 1] = (y * 13) % 256;
      png.data[i + 2] = (x * y) % 256;
      png.data[i + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}

/** A mostly-blank canvas with a small amount drawn, as a half-loaded map looks. */
function mostlyBlank(width: number, height: number, drawnFraction: number): Buffer {
  const png = new PNG({ width, height });
  const cutoff = Math.floor(height * drawnFraction);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) << 2;
      const drawn = y < cutoff;

      png.data[i] = drawn ? (x * 7) % 256 : 255;
      png.data[i + 1] = drawn ? (y * 13) % 256 : 255;
      png.data[i + 2] = drawn ? (x * y) % 256 : 255;
      png.data[i + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}

test.describe('blank canvas detection', () => {
  test('a solid white canvas is blank', () => {
    const d = dominance(solid(400, 300, [255, 255, 255]));

    expect(d.share).toBe(1);
    expect(d.colour).toBe('#ffffff');
    expect(d.share).toBeGreaterThan(BLANK_ABOVE);
  });

  test('a solid canvas of any colour is blank, not only white', () => {
    // The 150th maps load behind a maroon splash; a check that only knew about white would pass it.
    expect(dominance(solid(400, 300, [80, 0, 0])).share).toBeGreaterThan(BLANK_ABOVE);
    expect(dominance(solid(400, 300, [0, 0, 0])).share).toBeGreaterThan(BLANK_ABOVE);
  });

  test('a drawn map is not blank', () => {
    const d = dominance(varied(400, 300));

    expect(d.share).toBeLessThan(BLANK_ABOVE);
    expect(d.colours).toBeGreaterThan(100);
  });

  test('a canvas with only a sliver drawn still counts as blank', () => {
    // What a map looks like a second or two in. The poll must not accept this and stop waiting.
    expect(dominance(mostlyBlank(400, 300, 0.05)).share).toBeGreaterThan(BLANK_ABOVE);
  });

  test('a canvas drawn over most of its area is not blank', () => {
    // Comfortably inside the healthy range measured on both environments, 0.26 to 0.47 dominant.
    expect(dominance(mostlyBlank(400, 300, 0.55)).share).toBeLessThan(BLANK_ABOVE);
  });

  test('a canvas with only its buildings drawn is blank', () => {
    // What the campus maps looked like with no basemap: feature outlines on white, measured at 0.816.
    // The threshold has to be below this, which is what an earlier value of 0.85 was not.
    expect(dominance(mostlyBlank(400, 300, 0.18)).share).toBeGreaterThan(BLANK_ABOVE);
  });

  test('the threshold sits between the two states that were measured', () => {
    // Healthy maps 0.26 to 0.47; blank campus maps 0.815 to 0.955. Both ends measured on 1 October.
    expect(BLANK_ABOVE).toBeGreaterThan(0.47);
    expect(BLANK_ABOVE).toBeLessThan(0.815);
  });
});

/**
 * A stand-in for the Playwright page, so the waiting itself can be tested without a browser.
 *
 * `frames` is what the canvas measures on each successive reading. `waitForTimeout` advances a clock
 * the fake also reports through `Date.now`, so a ninety-second budget costs no real time.
 */
function fakePage(frames: Array<Buffer>) {
  let index = 0;
  const target = {
    count: async () => 1,
    screenshot: async () => frames[Math.min(index++, frames.length - 1)],
    first() {
      return this;
    }
  };

  return {
    locator: () => target,
    waitForTimeout: async () => undefined
  } as never;
}

test.describe('waiting for a map to paint', () => {
  test('a map that draws late is still judged to have drawn', async () => {
    // The real failure (#1285): a budget shorter than the draw time reports a healthy map as broken.
    // Four blank readings, then a drawn canvas that holds.
    const frames = [
      ...Array(4).fill(solid(40, 40, [255, 255, 255])),
      ...Array(6).fill(varied(40, 40))
    ];

    const paint = await waitForPaint(fakePage(frames), PAINT_TIMEOUT_MS);

    expect(paint.paintedAfterMs, describePaint('/late', paint)).not.toBeNull();
    expect(paint.share).toBeLessThan(BLANK_ABOVE);
  });

  test('a canvas that never draws is still reported as blank', async () => {
    const paint = await waitForPaint(fakePage([solid(40, 40, [255, 255, 255])]), 8_000);

    expect(paint.paintedAfterMs).toBeNull();
    expect(paint.share).toBeGreaterThanOrEqual(BLANK_ABOVE);
  });
});

test.describe('describing what was measured', () => {
  test('a blank canvas is described as blank', () => {
    const message = describePaint('/map', {
      share: 0.955,
      colour: '#ffffff',
      colours: 2,
      paintedAfterMs: null,
      steadyReadings: 0,
      readings: 12
    });

    expect(message).toContain('stayed blank');
    expect(message).not.toContain('never settled');
  });

  test('a drawn canvas that ran out of time is not described as blank', () => {
    // This is the message that was wrong: `/map` measured 0.484 - below the 0.65 blank threshold -
    // and was reported as "never painted", which told the reader the opposite of the number beside it.
    const message = describePaint('/map', {
      share: 0.484,
      colour: '#ffffff',
      colours: 900,
      paintedAfterMs: null,
      steadyReadings: 1,
      readings: 15
    });

    expect(message).toContain('drew but never settled');
    expect(message).not.toContain('stayed blank');
    expect(message).toContain('0.484');
  });

  test('a canvas that never appeared says so', () => {
    const message = describePaint('/map', {
      share: 1,
      colour: '#000000',
      colours: 0,
      paintedAfterMs: null,
      steadyReadings: 0,
      readings: 0
    });

    expect(message).toContain('never produced a canvas');
  });
});

test.describe('the budget', () => {
  test('is longer than the draw time the repository documents as normal', () => {
    // CLAUDE.md, "Things that look broken but are not": a canvas blank for 20 to 40 seconds is Esri
    // still drawing. A budget below that calls a healthy map broken, which is what #1285 was.
    const documentedSlowestNormalDrawMs = 40_000;

    expect(PAINT_TIMEOUT_MS).toBeGreaterThan(documentedSlowestNormalDrawMs);
  });
});
