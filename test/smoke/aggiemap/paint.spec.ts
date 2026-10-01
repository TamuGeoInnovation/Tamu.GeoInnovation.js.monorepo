import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

import { BLANK_ABOVE, dominance } from './paint';

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

  test('a canvas drawn over a third of its area is not blank', () => {
    // Comfortably inside the healthy range measured on both environments, 0.26 to 0.47 dominant.
    expect(dominance(mostlyBlank(400, 300, 0.35)).share).toBeLessThan(BLANK_ABOVE);
  });

  test('the threshold leaves room on both sides of what was measured', () => {
    // Healthy maps measured 0.26 to 0.47 on 1 October; a blank canvas is 1.
    expect(BLANK_ABOVE).toBeGreaterThan(0.47 + 0.2);
    expect(BLANK_ABOVE).toBeLessThan(1);
  });
});
