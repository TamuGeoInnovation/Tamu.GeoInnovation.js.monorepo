/**
 * A route's file name, and `--only` picking a route by it (#2841).
 *
 *   node --test tools/visual-baselines/*.test.mjs
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { matchesOnly, slugFor } from './slug.mjs';

const destination = '/events/big-event/map/d?map-type=Tool+Dropoff';

test('a builder destination has a file name with none of the characters -Only refuses', () => {
  assert.equal(slugFor(destination), 'events-big-event-map-d__map-type__Tool-Dropoff');
  assert.match(slugFor(destination), /^[A-Za-z0-9._-]+$/);
});

test('--only picks a route by part of it, as before', () => {
  assert.equal(matchesOnly(destination, ['big-event']), true);
  assert.equal(matchesOnly('/all-maps', ['big-event']), false);
});

test('--only picks a route by its exact file name, which a page pick gives', () => {
  assert.equal(matchesOnly(destination, ['events-big-event-map-d__map-type__Tool-Dropoff']), true);
  // a file name picks that route only, not every route it begins
  assert.equal(matchesOnly('/events/big-event', ['events-big-event-map-d__map-type__Tool-Dropoff']), false);
});
