// node --test tools/visual-baselines/rendered.test.mjs
//
// A shot counts only when the app itself rendered the page (#1936). On 18 October three Move-In pages came back as IIS's
// "404 - File or directory not found" during a blip, and the run still said 0 failed: in the comparison they read as
// 83% changes rather than as missing pages.

import test from 'node:test';
import assert from 'node:assert/strict';

import { whyNotRendered } from './rendered.mjs';

test('a page the app rendered, with a 2xx answer, counts', () => {
  assert.equal(whyNotRendered({ status: 200, rootContent: 12 }), null);
  assert.equal(whyNotRendered({ status: 204, rootContent: 1 }), null);
});

test("IIS's 404 page is not the app, whatever it shows", () => {
  assert.match(whyNotRendered({ status: 404, rootContent: 0 }), /404/);
});

test('an error status fails even if the app root drew', () => {
  assert.match(whyNotRendered({ status: 500, rootContent: 8 }), /500/);
});

test('a 2xx page without the app root, or with it empty, is not the app', () => {
  assert.match(whyNotRendered({ status: 200, rootContent: 0 }), /did not render/);
  assert.match(whyNotRendered({ status: 200, rootContent: null }), /did not render/);
});

test('no answer at all fails', () => {
  assert.match(whyNotRendered({ status: null, rootContent: 5 }), /no answer/);
});
