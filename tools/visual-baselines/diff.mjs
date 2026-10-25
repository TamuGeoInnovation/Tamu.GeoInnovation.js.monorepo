/**
 * Which pixels changed between two pictures, and a picture showing where (#2357).
 *
 * Works on raw RGBA pixels (width x height x 4 bytes, as pngjs reads a PNG), so it needs no PNG library
 * and its tests need no install. review.mjs reads and writes the files around it.
 */

/**
 * How far a colour channel may move before the pixel counts as changed. Map captures are not
 * byte-identical from one run to the next (#1105); 24 of 255 absorbs that without hiding a symbol
 * that moved or changed colour.
 */
export const THRESHOLD = 24;

/** The colour a changed pixel is painted in the picture of changes: bright, and in no map's palette. */
export const HIGHLIGHT = [255, 0, 200];

/**
 * Compares two pictures of the same size.
 *
 * Returns the share of pixels that changed, and, when asked, the picture of changes: the "after"
 * picture dimmed to a quarter of its brightness, so the page is still recognisable, with every
 * changed pixel painted in HIGHLIGHT. The dimmed page is what lets a reader tell a moved label from a
 * redrawn layer at a glance.
 */
export function comparePixels(before, after, { width, height, picture = false }) {
  const out = picture ? Buffer.alloc(width * height * 4) : null;
  let changed = 0;

  for (let i = 0; i < width * height * 4; i += 4) {
    const moved =
      Math.abs(before[i] - after[i]) > THRESHOLD ||
      Math.abs(before[i + 1] - after[i + 1]) > THRESHOLD ||
      Math.abs(before[i + 2] - after[i + 2]) > THRESHOLD;

    if (moved) {
      changed += 1;
    }

    if (out) {
      if (moved) {
        out[i] = HIGHLIGHT[0];
        out[i + 1] = HIGHLIGHT[1];
        out[i + 2] = HIGHLIGHT[2];
      } else {
        out[i] = Math.round(after[i] / 4);
        out[i + 1] = Math.round(after[i + 1] / 4);
        out[i + 2] = Math.round(after[i + 2] / 4);
      }

      out[i + 3] = 255;
    }
  }

  return { ratio: changed / (width * height), picture: out };
}
