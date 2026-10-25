/**
 * Which pixels changed between two pictures, and the picture of where (#2357).
 *
 *   node --test tools/visual-baselines/*.test.mjs
 *
 * Pictures are built in memory as raw RGBA, so nothing here needs a PNG library.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { comparePixels, HIGHLIGHT, THRESHOLD } from './diff.mjs';

/** A width x height picture of one colour. */
const solid = (width, height, [r, g, b]) => {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }

  return data;
};

const pixel = (data, width, x, y) => [...data.subarray((y * width + x) * 4, (y * width + x) * 4 + 4)];

test('identical pictures have nothing changed', () => {
  const a = solid(4, 3, [200, 100, 50]);

  assert.equal(comparePixels(a, Buffer.from(a), { width: 4, height: 3 }).ratio, 0);
});

test('a change within the threshold is rendering noise, not a change', () => {
  const a = solid(2, 2, [100, 100, 100]);
  const b = solid(2, 2, [100 + THRESHOLD, 100, 100 - THRESHOLD]);

  assert.equal(comparePixels(a, b, { width: 2, height: 2 }).ratio, 0);
});

test('the share of changed pixels is counted, and only changed pixels are painted', () => {
  const width = 4;
  const height = 2;
  const a = solid(width, height, [200, 200, 200]);
  const b = Buffer.from(a);

  // two of eight pixels change: one in red, one in blue
  b[0] = 0;
  b[(1 * width + 3) * 4 + 2] = 0;

  const { ratio, picture } = comparePixels(a, b, { width, height, picture: true });

  assert.equal(ratio, 2 / 8);
  assert.deepEqual(pixel(picture, width, 0, 0), [...HIGHLIGHT, 255]);
  assert.deepEqual(pixel(picture, width, 3, 1), [...HIGHLIGHT, 255]);
  assert.deepEqual(pixel(picture, width, 1, 0), [50, 50, 50, 255], 'an unchanged pixel is the after picture at a quarter');
});

test('no picture is made unless asked for', () => {
  const a = solid(2, 2, [0, 0, 0]);

  assert.equal(comparePixels(a, solid(2, 2, [255, 255, 255]), { width: 2, height: 2 }).picture, null);
});
