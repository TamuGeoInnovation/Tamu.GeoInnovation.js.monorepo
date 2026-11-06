/**
 * The arithmetic and the bookkeeping behind the network detour check (#2655).
 *
 *   node --test tools/network-detour/*.test.mjs
 *
 * Fixture responses only, so it runs without the routing service. The cases that matter are the ones
 * where the service answers success and is wrong: a pair with no route comes back as nothing, so a
 * tool that pairs results by position reports confident numbers for the wrong pairs.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { bandOf, classify, distanceMetres, joinRoutes, noRouteReason, pairsOf, reconcile, summarize } from './detour.mjs';

const building = (id, lon, lat, abbrev = null) => ({ id, abbrev, name: `Building ${id}`, lon, lat });

/** A /solve response with one route per name given, in the order given. */
const solved = (...routes) => ({
  routes: { features: routes.map(([name, length]) => ({ attributes: { Name: name, Total_Length: length } })) }
});

test('straight-line distance is in metres', () => {
  // One thousandth of a degree of latitude is about 111 m anywhere.
  assert.equal(Math.round(distanceMetres(building(1, -96.34, 30.61), building(2, -96.34, 30.611))), 111);
});

test('a route is joined to its pair by name, not by where it comes in the answer', () => {
  const pairs = [
    { key: 'p0', from: 1, to: 2 },
    { key: 'p1', from: 1, to: 3 },
    { key: 'p2', from: 2, to: 3 }
  ];

  // p1 could not be routed, so the service leaves it out and says nothing. A positional join would
  // give p1 the length of p2.
  const { routed, missing } = joinRoutes(pairs, solved(['p0', 120], ['p2', 340]));

  assert.deepEqual(
    [...routed],
    [
      ['p0', 120],
      ['p2', 340]
    ]
  );
  assert.deepEqual(missing, ['p1']);
});

test('a route with no name fails loudly rather than being guessed at', () => {
  const pairs = [{ key: 'p0', from: 1, to: 2 }];

  assert.throws(() => joinRoutes(pairs, { routes: { features: [{ attributes: { Total_Length: 50 } }] } }), /no name/);
});

test('a route for a pair that was never sent fails loudly', () => {
  const pairs = [{ key: 'p0', from: 1, to: 2 }];

  assert.throws(() => joinRoutes(pairs, solved(['p0', 50], ['p9', 60])), /p9/);
});

test('the same pair answered twice fails loudly', () => {
  const pairs = [{ key: 'p0', from: 1, to: 2 }];

  assert.throws(() => joinRoutes(pairs, solved(['p0', 50], ['p0', 60])), /twice/);
});

test('a batch in which no pair can be routed is every pair missing, not a failed run', () => {
  // With ignoreInvalidLocations=true the service skips pairs it cannot route, unless it can route none
  // of them: then it answers with an error listing each one. Seen on 6 November 2026, when a whole batch
  // started at a building the network does not reach.
  const pairs = [
    { key: '1089-1430', from: 1089, to: 1430 },
    { key: '1089-1431', from: 1089, to: 1431 }
  ];
  const response = {
    error: {
      code: 400,
      message: 'Unable to complete operation.',
      details: [
        'No route for "1089-1430" from location "1089" to location "1430".  No route for "1089-1431" from location "1089" to location "1431".  No solution found.'
      ]
    }
  };

  assert.deepEqual(joinRoutes(pairs, response), { routed: new Map(), missing: ['1089-1430', '1089-1431'] });
});

test('a batch whose only reasons are unlocated stops is every pair missing too', () => {
  const pairs = [
    { key: '1089-1811', from: 1089, to: 1811 },
    { key: '1089-1689', from: 1089, to: 1689 }
  ];
  const response = {
    error: {
      code: 400,
      message: 'Unable to complete operation.',
      details: [
        'Location "1811" in "Stops" is unlocated.  Need at least 2 valid stops for route "1089-1811".  No route for "1089-1689" from location "1089" to location "1689".'
      ]
    }
  };

  assert.deepEqual(joinRoutes(pairs, response).missing, ['1089-1811', '1089-1689']);
});

test('any other error from the service stops the run', () => {
  const pairs = [{ key: 'p0', from: 1, to: 2 }];

  assert.throws(
    () => joinRoutes(pairs, { error: { code: 500, message: 'Service unavailable', details: [] } }),
    /Service unavailable/
  );
});

test('a batch whose counts do not add up fails, naming the pair nobody accounted for', () => {
  const pairs = [
    { key: 'p0', from: 1, to: 2 },
    { key: 'p1', from: 1, to: 3 },
    { key: 'p2', from: 2, to: 3 }
  ];
  const routed = new Map([['p0', 120]]);
  const explained = new Map([['p2', 'No solution found.']]);

  assert.throws(() => reconcile(pairs, routed, explained), /p1 \(1 to 3\)/);
});

test('a batch whose counts add up passes', () => {
  const pairs = [
    { key: 'p0', from: 1, to: 2 },
    { key: 'p1', from: 1, to: 3 }
  ];

  assert.doesNotThrow(() => reconcile(pairs, new Map([['p0', 120]]), new Map([['p1', 'No solution found.']])));
});

test("the server's own reason is kept, word for word", () => {
  const response = {
    error: {
      code: 400,
      message: 'Unable to complete operation.',
      details: ['No route for "p0000" from location "1044" to location "1084".  No solution found.']
    }
  };

  assert.equal(noRouteReason(response), 'No route for "p0000" from location "1044" to location "1084".  No solution found.');
});

test('a pair is flagged on a threshold that loosens for short lines', () => {
  // 50 m of detour: a ratio of 1.25 on a 200 m line and 1.025 on a 2 km one. Neither is a fault.
  assert.equal(classify(200, 250).verdict, 'ok');
  assert.equal(classify(2000, 2050).verdict, 'ok');
  // Four times the straight line, on a line long enough that snapping cannot explain it, is.
  assert.equal(classify(600, 2400).verdict, 'detour');
  // A ratio of 3.3 on a 150 m line is two buildings with a road between them; 2.1 on a 1.5 km line is a
  // missing link.
  assert.equal(classify(150, 500).verdict, 'ok');
  assert.equal(classify(1500, 3200).verdict, 'detour');
});

test('a ratio below 1.0 is impossible and is never reported as a good result', () => {
  const result = classify(500, 420);

  assert.equal(result.verdict, 'impossible');
  assert.ok(result.ratio < 1);
});

test('the threshold and the slack can be changed', () => {
  assert.equal(classify(1000, 1700, { threshold: 1.5, slackMetres: 100 }).verdict, 'detour');
  assert.equal(classify(1000, 1700).verdict, 'ok');
});

test('distance bands are by straight-line metres', () => {
  assert.equal(bandOf(100), '0-250 m');
  assert.equal(bandOf(250), '250-500 m');
  assert.equal(bandOf(1999), '1-2 km');
  assert.equal(bandOf(5000), '2 km +');
});

test('walking pairs are unordered and driving pairs are ordered, since one-way streets make A to B and B to A different questions', () => {
  const buildings = [building(1, 0, 0), building(2, 0, 0.001), building(3, 0, 0.002)];

  assert.equal(pairsOf(buildings, 'Walk').length, 3);
  assert.equal(pairsOf(buildings, 'Drive').length, 6);
  assert.deepEqual(
    pairsOf(buildings, 'Walk').map((p) => [p.from, p.to]),
    [
      [1, 2],
      [1, 3],
      [2, 3]
    ]
  );
});

test('a building that reaches nothing is told apart from a pair that cannot be joined', () => {
  const buildings = [
    building(1, 0, 0, 'AAA'),
    building(2, 0, 0.003, 'BBB'),
    building(3, 0, 0.006, 'CCC'),
    building(4, 0, 0.009)
  ];
  const results = [
    { from: 1, to: 2, straight: 333, network: 400 },
    { from: 1, to: 3, straight: 667, network: 800 },
    { from: 2, to: 3, straight: 333, unreachable: 'No solution found.' },
    { from: 1, to: 4, straight: 1000, unreachable: 'No solution found.' },
    { from: 2, to: 4, straight: 667, unreachable: 'No solution found.' },
    { from: 3, to: 4, straight: 333, unreachable: 'No solution found.' }
  ];

  const summary = summarize(results, buildings);

  assert.deepEqual(
    summary.isolated.map((b) => b.id),
    [4]
  );
  assert.deepEqual(
    summary.unreachablePairs.map((p) => [p.from.id, p.to.id]),
    [[2, 3]]
  );
});

test('a building tested against one other is not called isolated on the strength of one pair', () => {
  const buildings = [building(1, 0, 0), building(2, 0, 0.01), building(3, 0, 0.02)];
  const results = [
    { from: 1, to: 2, straight: 1100, network: 1300 },
    { from: 1, to: 3, straight: 2200, unreachable: 'No solution found.' }
  ];

  const summary = summarize(results, buildings);

  assert.deepEqual(summary.isolated, []);
  assert.equal(summary.unreachablePairs.length, 1);
});

test('outliers come worst first, by excess metres, with the ratio beside them', () => {
  const buildings = [building(1, 0, 0), building(2, 0, 0.01), building(3, 0, 0.02)];
  const results = [
    { from: 1, to: 2, straight: 1100, network: 3000 },
    { from: 1, to: 3, straight: 2200, network: 8000 },
    { from: 2, to: 3, straight: 1100, network: 1200 }
  ];

  const { outliers } = summarize(results, buildings);

  assert.deepEqual(
    outliers.map((o) => [o.from.id, o.to.id, Math.round(o.excess)]),
    [
      [1, 3, 5800],
      [1, 2, 1900]
    ]
  );
  assert.equal(outliers[0].ratio.toFixed(2), '3.64');
});

test('an impossible ratio is reported on its own, above everything else', () => {
  const buildings = [building(1, 0, 0), building(2, 0, 0.01)];
  const summary = summarize([{ from: 1, to: 2, straight: 1100, network: 900 }], buildings);

  assert.equal(summary.impossible.length, 1);
  assert.equal(summary.outliers.length, 0);
});
