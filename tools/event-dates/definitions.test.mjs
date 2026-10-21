/**
 * Reading the schedule pages out of the definitions (#2050).
 *
 *   node --test tools/event-dates/*.test.mjs
 *
 * Reads the real definitions, so a map whose schedule the tool cannot see is caught here and not by
 * somebody noticing its dates went stale.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { readDefinitions } from './definitions.mjs';

const map = (id) => readDefinitions().find((m) => m.id === id);

test("tennis is checked against the men's and the women's schedule", () => {
  // The map covers both teams' home matches at the Mitchell Tennis Center; with the men's page alone,
  // every women's match was missing and nothing said so.
  assert.deepEqual(map('tennis-parking').schedules, [
    'https://12thman.com/sports/mens-tennis/schedule',
    'https://12thman.com/sports/womens-tennis/schedule'
  ]);
});

test('a map with one schedule page has a list of one', () => {
  assert.deepEqual(map('football-parking').schedules, ['https://12thman.com/sports/football/schedule']);
});

test('a schedule that is computed rather than written out is reported, not read', () => {
  const tailgating = map('tailgating');

  assert.deepEqual(tailgating.schedules, []);
  assert.equal(tailgating.scheduleExpression, 'FootballParkingConfiguration.scheduleUrl');
});
