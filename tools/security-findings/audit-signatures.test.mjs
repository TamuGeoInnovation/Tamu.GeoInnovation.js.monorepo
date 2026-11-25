/**
 * `audit-signatures.mjs` (#3439): a registry that fails to answer is tried again; a real signature failure never is.
 *
 * Run by `tools-tests.yml` with `node --test 'tools/**\/*.test.mjs'`. The outputs are npm's own words.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isTransient, withRetries } from './audit-signatures.mjs';

const FETCH = `npm error code FETCH_ERROR
npm error errno FETCH_ERROR
npm error invalid json response body at https://registry.npmjs.org/-/npm/v1/attestations/postcss-normalize-url@7.0.3 reason: Unexpected token 'O', "OK
npm error " is not valid JSON`;

const INVALID = `audited 1600 packages in 12s

1 package has an invalid registry signature:

left-pad@1.3.0 (https://registry.npmjs.org/)

Someone might have tampered with this package since it was published on the registry!`;

const PASSED = 'audited 1600 packages in 12s\n\n1600 packages have verified registry signatures';

/** A run that answers with each of `results` in turn, and counts its calls. */
function runs(...results) {
  const run = () => results[Math.min(run.calls++, results.length - 1)];
  run.calls = 0;
  return run;
}

const noWait = { sleep: async () => undefined };

test('the registry answering "OK" instead of JSON is transient', () => {
  assert.equal(isTransient(FETCH), true);
});

test('an invalid signature is not transient', () => {
  assert.equal(isTransient(INVALID), false);
});

test('a fetch error, then a pass, passes on the second try', async () => {
  const run = runs({ status: 1, output: FETCH }, { status: 0, output: PASSED });
  const result = await withRetries(run, noWait);

  assert.equal(result.status, 0);
  assert.equal(run.calls, 2);
});

test('an invalid signature fails at once, without trying again', async () => {
  const run = runs({ status: 1, output: INVALID }, { status: 0, output: PASSED });
  const result = await withRetries(run, noWait);

  assert.equal(result.status, 1);
  assert.equal(run.calls, 1);
});

test('a registry that never answers fails after three tries', async () => {
  const run = runs({ status: 1, output: FETCH });
  const result = await withRetries(run, noWait);

  assert.equal(result.status, 1);
  assert.equal(result.attempts, 3);
  assert.equal(run.calls, 3);
});

test('waits between tries', async () => {
  const waits = [];
  const run = runs({ status: 1, output: FETCH }, { status: 1, output: FETCH }, { status: 0, output: PASSED });

  await withRetries(run, { pauseMs: 10000, sleep: async (ms) => void waits.push(ms) });

  assert.deepEqual(waits, [10000, 10000]);
});

test('a pass the first time runs once', async () => {
  const run = runs({ status: 0, output: PASSED });

  assert.equal((await withRetries(run, noWait)).status, 0);
  assert.equal(run.calls, 1);
});
