// node --test tools/visual-baselines/drawn.test.mjs
//
// A map is photographed only once the page shows it drawn (#1937). In production's 16 October set two pages were taken
// blank, the layer list still spinning, although the capture had waited for the probe's `drawing === false`: a single
// reading of it is not the page being finished.

import test from 'node:test';
import assert from 'node:assert/strict';

import { drawnFor, STEADY_READINGS } from './drawn.mjs';

const finished = { ready: true, drawing: false, spinners: 0 };

test('a map finished for the last two seconds of readings is drawn', () => {
  assert.equal(drawnFor(Array(STEADY_READINGS).fill(finished)), true);
});

test('one reading of drawing === false is not enough', () => {
  assert.equal(drawnFor([{ ...finished, drawing: true }, finished]), false);
});

test('a layer list still spinning is not drawn, whatever the probe says', () => {
  assert.equal(drawnFor(Array(STEADY_READINGS).fill({ ...finished, spinners: 2 })), false);
});

test('a map whose layers went back to loading is not drawn', () => {
  const readings = Array(STEADY_READINGS).fill(finished);
  readings[STEADY_READINGS - 1] = { ...finished, ready: false };
  assert.equal(drawnFor(readings), false);
});

test('a page with no map probe needs only its spinners to have stopped', () => {
  const page = { ready: null, drawing: null, spinners: 0 };
  assert.equal(drawnFor(Array(STEADY_READINGS).fill(page)), true);
  assert.equal(drawnFor(Array(STEADY_READINGS).fill({ ...page, spinners: 1 })), false);
});
