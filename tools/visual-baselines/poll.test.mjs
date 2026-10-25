/**
 * When the cluster captures a release by itself (#2355).
 *
 *   node --test tools/visual-baselines/*.test.mjs
 *
 * Times are built in UTC and read in US Central, as the poller reads them: on 25 October 2026 Central is
 * UTC-5 (daylight time).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { act, centralMinutes, inQuiet, missingComparisons, plan, runningCapture, setState } from './poll.mjs';

/** 25 October 2026 at hh:mm US Central (UTC-5 that day). */
const central = (hh, mm = 0) => new Date(Date.UTC(2026, 9, 25, hh + 5, mm));

const done = { completedAt: '2026-10-25 16:00:00 US Central', failed: 0, capturedAt: '2026-10-25 13:37:00 US Central' };

test('Central time is read from the clock, not the machine time zone', () => {
  assert.equal(centralMinutes(central(13, 37)), 13 * 60 + 37);
  // in January Central is UTC-6
  assert.equal(centralMinutes(new Date(Date.UTC(2027, 0, 5, 12, 0))), 6 * 60);
});

test('the quiet window covers the nightly run, and may cross midnight', () => {
  assert.equal(inQuiet(central(2, 29), '02:30-08:30'), false);
  assert.equal(inQuiet(central(2, 30), '02:30-08:30'), true);
  assert.equal(inQuiet(central(6, 17), '02:30-08:30'), true);
  assert.equal(inQuiet(central(8, 30), '02:30-08:30'), false);
  assert.equal(inQuiet(central(23, 0), '22:00-02:00'), true);
  assert.equal(inQuiet(central(1, 0), '22:00-02:00'), true);
  assert.equal(inQuiet(central(12, 0), '22:00-02:00'), false);
});

test('a set is complete once its capture finished, even with shots failed; started and unfinished is resumed', () => {
  assert.equal(setState(null), 'missing');
  assert.equal(setState({ capturedAt: 'x' }), 'unfinished');
  assert.equal(setState({ ...done, failed: 3 }), 'complete');
});

test('a new tag waits an hour for its smoke runs', () => {
  const tags = [{ environment: 'development', tag: 'dev-2026-10-25', taggedAt: central(13, 21) }];

  assert.equal(plan({ tags, sets: {}, now: central(14, 0) }).capture, null);
  assert.deepEqual(plan({ tags, sets: {}, now: central(14, 22) }).capture, { environment: 'development', tag: 'dev-2026-10-25' });
});

test('nothing starts in the quiet window, however long the tag has waited', () => {
  const tags = [{ environment: 'production', tag: 'prod-2026-10-25', taggedAt: central(0, 0) }];
  const decided = plan({ tags, sets: {}, now: central(5, 50) });

  assert.equal(decided.capture, null);
  assert.match(decided.reasons[0], /quiet/);
  assert.notEqual(plan({ tags, sets: {}, now: central(8, 31) }).capture, null);
});

test('a captured release is left alone; an unfinished one is resumed', () => {
  const tags = [{ environment: 'development', tag: 'dev-2026-10-25', taggedAt: central(9, 0) }];

  assert.equal(plan({ tags, sets: { 'development/dev-2026-10-25': done }, now: central(15, 0) }).capture, null);
  assert.notEqual(plan({ tags, sets: { 'development/dev-2026-10-25': { capturedAt: 'x' } }, now: central(15, 0) }).capture, null);
});

test('a set someone is capturing now is left alone, and one abandoned is resumed', () => {
  const tags = [{ environment: 'development', tag: 'dev-2026-10-25', taggedAt: central(13, 21) }];
  const sets = { 'development/dev-2026-10-25': { capturedAt: '2026-10-25 13:37:00 US Central' } };

  const running = plan({ tags, sets, lastWrites: { 'development/dev-2026-10-25': central(14, 50) }, now: central(15, 0) });

  assert.equal(running.capture, null);
  assert.match(running.reasons[0], /being captured now/);
  assert.notEqual(plan({ tags, sets, lastWrites: { 'development/dev-2026-10-25': central(14, 0) }, now: central(15, 0) }).capture, null);
});

test('with two releases waiting, the older tag goes first', () => {
  const tags = [
    { environment: 'development', tag: 'dev-2026-10-25', taggedAt: central(10, 0) },
    { environment: 'production', tag: 'prod-2026-10-25', taggedAt: central(9, 0) }
  ];

  assert.equal(plan({ tags, sets: {}, now: central(15, 0) }).capture.tag, 'prod-2026-10-25');
});

test('the newest finished set of each kind is compared with the one before it, once', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'poll-'));
  const write = (kind, name, manifest) => {
    fs.mkdirSync(path.join(out, kind, name), { recursive: true });
    fs.writeFileSync(path.join(out, kind, name, 'manifest.json'), JSON.stringify(manifest));
  };
  const summary = (name, body) => {
    fs.mkdirSync(path.join(out, 'compare', name), { recursive: true });
    fs.writeFileSync(path.join(out, 'compare', name, 'summary.json'), JSON.stringify(body));
  };

  write('development', 'dev-2026-10-06-4', { ...done, capturedAt: '2026-10-06 12:00:00 US Central', completedAt: '2026-10-06 14:00:00 US Central' });
  write('development', 'dev-2026-10-21', { ...done, capturedAt: '2026-10-21 12:00:00 US Central', completedAt: '2026-10-21 14:00:00 US Central' });
  write('development', 'dev-2026-10-22', { capturedAt: '2026-10-22 12:00:00 US Central' }); // never finished
  write('development', 'dev-2026-10-25', { ...done, capturedAt: '2026-10-25 13:37:00 US Central', completedAt: '2026-10-25 16:45:00 US Central' });
  write('production', 'prod-2026-10-20', done); // only one: nothing to compare with
  write('development-as-production', 'dev-2026-10-18-3', { ...done, capturedAt: '2026-10-18 12:00:00 US Central' });
  write('development-as-production', 'dev-2026-10-21', { ...done, capturedAt: '2026-10-21 12:00:00 US Central' });

  assert.deepEqual(missingComparisons(out), [
    { kind: 'development', before: 'dev-2026-10-21', after: 'dev-2026-10-25', name: 'dev-2026-10-21-vs-dev-2026-10-25' },
    {
      kind: 'development-as-production',
      before: 'dev-2026-10-18-3',
      after: 'dev-2026-10-21',
      name: 'development-as-production-dev-2026-10-18-3-vs-development-as-production-dev-2026-10-21'
    }
  ]);

  // made while dev-2026-10-25 was still being captured: too early, so made again
  summary('dev-2026-10-21-vs-dev-2026-10-25', {
    before: 'development/dev-2026-10-21',
    after: 'development/dev-2026-10-25',
    writtenAt: '2026-10-25 14:31:14 US Central'
  });
  assert.equal(missingComparisons(out).filter((c) => c.kind === 'development').length, 1);

  // made after it finished: current
  summary('dev-2026-10-21-vs-dev-2026-10-25', {
    before: 'development/dev-2026-10-21',
    after: 'development/dev-2026-10-25',
    writtenAt: '2026-10-25 16:50:00 US Central'
  });
  assert.equal(missingComparisons(out).filter((c) => c.kind === 'development').length, 0);
});

test('nothing starts while any capture is running, of any kind', () => {
  const tags = [{ environment: 'production', tag: 'prod-2026-10-22', taggedAt: central(0, 0) }];
  const decided = plan({ tags, sets: {}, running: 'development/dev-2026-10-25', now: central(15, 0) });

  assert.equal(decided.capture, null);
  assert.match(decided.reasons[0], /development\/dev-2026-10-25 is being captured now/);
});

test('a running capture is seen on the volume: unfinished and written to recently', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'poll-'));
  const dir = path.join(out, 'development', 'dev-2026-10-25');

  fs.mkdirSync(path.join(dir, 'desktop'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ capturedAt: 'x' }));
  fs.writeFileSync(path.join(dir, 'desktop', 'a.png'), 'png');

  assert.equal(runningCapture(out), 'development/dev-2026-10-25');
  assert.equal(runningCapture(out, new Date(Date.now() + 20 * 60000)), null, 'abandoned after 15 quiet minutes');

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(done));
  assert.equal(runningCapture(out), null, 'a finished set is not running');
});

test('a waiting comparison is made before a capture starts, and the capture gets its own after', () => {
  const calls = [];
  let pending = [{ kind: 'development', before: 'dev-2026-10-06-4', after: 'dev-2026-10-25', name: 'dev-2026-10-06-4-vs-dev-2026-10-25' }];
  const node = (script, args) => {
    calls.push(script === 'review.mjs' ? `review ${path.basename(args[1])}` : script);

    if (script === 'review.mjs') {
      pending = [];
    }

    if (script === 'capture.mjs') {
      // the capture finishing leaves its own comparison to make
      pending = [{ kind: 'production', before: 'prod-2026-10-20', after: 'prod-2026-10-22', name: 'prod-2026-10-20-vs-prod-2026-10-22' }];
    }

    return 0;
  };

  act({ capture: { environment: 'production', tag: 'prod-2026-10-22' } }, '/sets', { node, missing: () => pending, running: () => null });

  assert.deepEqual(calls, ['review dev-2026-10-25', 'index.mjs', 'capture.mjs', 'review prod-2026-10-22', 'index.mjs']);
});

test('no comparison is made while another capture runs', () => {
  const calls = [];

  act({ capture: null }, '/sets', {
    node: (script) => calls.push(script),
    missing: () => [{ kind: 'development', before: 'a', after: 'b', name: 'a-vs-b' }],
    running: () => 'development/dev-2026-10-25'
  });

  assert.deepEqual(calls, []);
});
