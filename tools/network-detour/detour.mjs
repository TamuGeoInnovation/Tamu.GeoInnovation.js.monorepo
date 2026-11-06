/**
 * The arithmetic and the bookkeeping behind the network detour check (#2655), kept apart from the
 * requests so it can be tested on fixture responses.
 *
 * A route far longer than the straight line between its ends is the signature of a network fault: a
 * missing connection, a wrong one-way, a disconnected island. No route at all is the same fault, worse.
 */

/** Earth's mean radius, in metres. */
const EARTH_METRES = 6371008.8;

/** Straight-line (great-circle) distance between two buildings, in metres. */
export function distanceMetres(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_METRES * Math.asin(Math.sqrt(h));
}

/**
 * The travel modes whose pairs are ordered. `Drive` has the network's `One Way` restriction, so A to B
 * and B to A are different questions; on foot or by bike the pair is effectively symmetric.
 */
const ORDERED_MODES = new Set(['Drive']);

/** Every pair of buildings to ask about, keyed by OBJECTID, with its straight-line distance. */
export function pairsOf(buildings, mode) {
  const ordered = ORDERED_MODES.has(mode);
  const pairs = [];

  for (let i = 0; i < buildings.length; i++) {
    for (let j = ordered ? 0 : i + 1; j < buildings.length; j++) {
      if (i === j) continue;
      pairs.push(pairOf(buildings[i], buildings[j]));
    }
  }

  return pairs;
}

/** One pair. Its key is what the service will call the route, so the answer joins back to it. */
export const pairOf = (a, b) => ({ key: `${a.id}-${b.id}`, from: a.id, to: b.id, straight: distanceMetres(a, b) });

/**
 * Joins a `/solve` answer to the pairs that were sent, **by route name and never by position**.
 *
 * A pair the service cannot route is left out of the answer with no error, so the routes that come
 * back are a subset in no promised order. Zipping them against the input mis-pairs every route after
 * the first gap. Anything that cannot be joined with certainty throws: a nameless route, a name that was
 * not sent, or a pair answered twice. So does an error from the service, unless it is the one that
 * means no pair in the batch could be routed.
 */
export function joinRoutes(pairs, response) {
  if (response.error) {
    // With ignoreInvalidLocations=true the service skips what it cannot route, unless it can route none
    // of the batch: then it answers with an error giving a reason per pair ("No route for", "is
    // unlocated"). That is every pair missing, to be asked again one at a time. An error that names no
    // pair from the batch - an outage, a token, a bad parameter - is a failure.
    const said = noRouteReason(response);

    if (!pairs.some((p) => said.includes(`"${p.key}"`)))
      throw new Error(`/solve failed for a batch of ${pairs.length}: ${said}`);

    return { routed: new Map(), missing: pairs.map((p) => p.key) };
  }

  const sent = new Set(pairs.map((p) => p.key));
  const routed = new Map();

  for (const feature of response.routes?.features ?? []) {
    const { Name: name, Total_Length: length } = feature.attributes ?? {};

    if (!name)
      throw new Error(
        `A route came back with no name, so it cannot be joined to a pair: ${JSON.stringify(feature.attributes)}`
      );
    if (!sent.has(name)) throw new Error(`A route came back for ${name}, which was not sent in this batch`);
    if (routed.has(name)) throw new Error(`${name} was answered twice`);
    if (typeof length !== 'number') throw new Error(`The route for ${name} has no Total_Length`);

    routed.set(name, length);
  }

  return { routed, missing: pairs.filter((p) => !routed.has(p.key)).map((p) => p.key) };
}

/**
 * Fails, naming them, when a batch's pairs are not all accounted for: each one must have come back as
 * a route or been explained by the server. A count that does not add up is the tool measuring itself
 * wrongly, and the numbers it would go on to report could not be trusted.
 */
export function reconcile(pairs, routed, explained) {
  const lost = pairs.filter((p) => !routed.has(p.key) && !explained.has(p.key));

  if (lost.length) {
    throw new Error(
      `${pairs.length} pairs sent, ${routed.size} routed, ${explained.size} explained: ${lost.length} unaccounted for - ` +
        lost.map((p) => `${p.key} (${p.from} to ${p.to})`).join(', ')
    );
  }
}

/** The server's own words for why a pair has no route, from a `/solve` asked with `ignoreInvalidLocations=false`. */
export function noRouteReason(response) {
  const error = response.error;

  if (!error) return undefined;

  return [...(error.details ?? [])].filter(Boolean).join(' ') || error.message || `error ${error.code}`;
}

/**
 * How far a route may exceed the straight line before it is called a detour. The allowance is a ratio
 * plus a fixed slack, so it loosens for short lines: 50 m of detour is a ratio of 1.25 on a 200 m line
 * and 1.025 on a 2 km one, and a flat ratio fills the report with neighbours separated by a road.
 */
export const DEFAULT_THRESHOLD = { threshold: 1.8, slackMetres: 250 };

/**
 * What a route says about the network: `ok`, `detour`, or `impossible` when the route is shorter than
 * the straight line, which a path cannot be. An impossible result means the measurement or the
 * coordinates are wrong, and it is never a good result.
 *
 * Two buildings recorded at the same point have no ratio (`null`): 0/0 is not a number, and one NaN
 * in a band's ratios is enough to scramble its sort and so its median. Their route is still judged by
 * the slack.
 */
export function classify(straight, network, { threshold, slackMetres } = DEFAULT_THRESHOLD) {
  const ratio = straight > 0 ? network / straight : null;
  const excess = network - straight;

  if (ratio !== null && ratio < 1) return { verdict: 'impossible', ratio, excess };

  return { verdict: network > straight * threshold + slackMetres ? 'detour' : 'ok', ratio, excess };
}

/** Straight-line distance bands, because the ratio means different things at different distances. */
export const BANDS = [
  ['0-250 m', 250],
  ['250-500 m', 500],
  ['500 m-1 km', 1000],
  ['1-2 km', 2000],
  ['2 km +', Infinity]
];

export const bandOf = (metres) => BANDS.find(([, below]) => metres < below)[0];

/**
 * Turns per-pair results into the report: impossible results first, then detours worst first by excess
 * metres, then what cannot be reached.
 *
 * Buildings the routed pairs join are one piece of network. Every piece but the largest is an **island**:
 * its buildings reach each other, if there are several, and nothing else. That is a different fault from
 * a pair of connected buildings that cannot be joined, so the two are reported apart, and an island's
 * failed pairs are not listed one by one. It takes two failed pairs to put a building on an island: a
 * building tested against one other, as in a `one` run, has said nothing yet about what else it reaches.
 *
 * Each result is `{ from, to, straight, network }` or `{ from, to, straight, unreachable: reason }`.
 */
export function summarize(results, buildings, threshold = DEFAULT_THRESHOLD) {
  const byId = new Map(buildings.map((b) => [b.id, b]));
  const failed = new Map(buildings.map((b) => [b.id, 0]));
  const detoursOf = new Map();
  const piece = new Map(buildings.map((b) => [b.id, b.id]));
  const root = (id) => {
    while (piece.get(id) !== id) {
      piece.set(id, piece.get(piece.get(id)));
      id = piece.get(id);
    }
    return id;
  };
  const bands = new Map(BANDS.map(([name]) => [name, { pairs: 0, routed: 0, detours: 0, ratios: [] }]));
  const impossible = [];
  const outliers = [];
  const unreachable = [];

  for (const r of results) {
    const band = bands.get(bandOf(r.straight));

    band.pairs++;

    if (r.unreachable !== undefined) {
      unreachable.push(r);
      for (const id of [r.from, r.to]) failed.set(id, failed.get(id) + 1);
      continue;
    }

    piece.set(root(r.from), root(r.to));
    band.routed++;

    const c = classify(r.straight, r.network, threshold);

    if (c.ratio !== null) band.ratios.push(c.ratio);

    const row = { from: byId.get(r.from), to: byId.get(r.to), straight: r.straight, network: r.network, ...c };

    if (c.verdict === 'impossible') impossible.push(row);
    if (c.verdict === 'detour') {
      band.detours++;
      outliers.push(row);
      for (const id of [r.from, r.to]) detoursOf.set(id, (detoursOf.get(id) ?? 0) + 1);
    }
  }

  const pieces = new Map();

  for (const b of buildings) pieces.set(root(b.id), [...(pieces.get(root(b.id)) ?? []), b]);

  const largest = Math.max(...[...pieces.values()].map((p) => p.length));
  const islands = [...pieces.values()]
    .filter((p) => p.length < largest && p.every((b) => failed.get(b.id) >= 2))
    .sort((a, b) => b.length - a.length);
  const islanders = new Set(islands.flat().map((b) => b.id));

  return {
    pairs: results.length,
    routed: results.length - unreachable.length,
    bands: [...bands].map(([name, b]) => ({
      band: name,
      pairs: b.pairs,
      routed: b.routed,
      detours: b.detours,
      ...spread(b.ratios)
    })),
    impossible: impossible.sort((a, b) => a.ratio - b.ratio),
    outliers: outliers.sort((a, b) => b.excess - a.excess),
    detourBuildings: [...detoursOf].sort((a, b) => b[1] - a[1]).map(([id, detours]) => ({ ...byId.get(id), detours })),
    islands: islands.map((p) => p.map((b) => ({ ...b, unreachable: failed.get(b.id) }))),
    unreachablePairs: unreachable
      .filter((r) => !islanders.has(r.from) && !islanders.has(r.to))
      .map((r) => ({ from: byId.get(r.from), to: byId.get(r.to), straight: r.straight, reason: r.unreachable }))
  };
}

/** The median and worst ratio of a band. */
function spread(ratios) {
  if (!ratios.length) return { median: null, worst: null };

  const sorted = [...ratios].sort((a, b) => a - b);

  return { median: sorted[Math.floor(sorted.length / 2)], worst: sorted[sorted.length - 1] };
}
