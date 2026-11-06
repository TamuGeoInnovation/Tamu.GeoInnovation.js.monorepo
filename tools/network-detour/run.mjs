/**
 * Compares routes through the campus routing network with the straight line between their ends, to
 * find where the network is wrong (#2655).
 *
 *   node tools/network-detour/run.mjs quick                 # the committed pairs, a couple of minutes
 *   node tools/network-detour/run.mjs full --workers 8      # every building to every other; resumable
 *   node tools/network-detour/run.mjs one MSC               # one building against every other
 *   node tools/network-detour/run.mjs one MSC ZACH          # one pair
 *   node tools/network-detour/run.mjs sample                # print a fresh stratified sample for quick-pairs.json
 *
 * **Development only.** The network is published on the development GIS server alone; production has
 * no routing service. A run says so in its first line and in its run file, so it is never taken for a
 * test of production. See README.md for the flags and for what each result means.
 */
import * as fs from 'fs';
import * as path from 'path';

import {
  DEFAULT_THRESHOLD,
  bandOf,
  classify,
  joinRoutes,
  noRouteReason,
  pairOf,
  pairsOf,
  reconcile,
  summarize
} from './detour.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '..', '..');
const QUICK_PAIRS = path.join(HERE, 'quick-pairs.json');
const MODES = ['Walk', 'Bike', 'Bus', 'Drive', 'Walk_ADA'];

// ---- arguments -------------------------------------------------------------------------------------

const [tier, ...rest] = process.argv.slice(2);
const positional = [];
const flags = {};

for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--'))
    flags[rest[i].slice(2)] = rest[i + 1]?.startsWith('--') || rest[i + 1] === undefined ? true : rest[++i];
  else positional.push(rest[i]);
}

if (!['quick', 'full', 'one', 'sample'].includes(tier)) {
  console.error(
    'Usage: run.mjs <quick|full|one|sample> [--mode Walk] [--network <url>] [--threshold 1.8] [--slack 250] [--workers 4] [--batch 100] [--compare <run.json>]'
  );
  process.exit(2);
}

const mode = flags.mode ?? 'Walk';
if (!MODES.includes(mode)) fail(`--mode must be one of ${MODES.join(', ')}; got ${mode}`);

const network = flags.network ?? defaultNetwork();
const threshold = {
  threshold: Number(flags.threshold ?? DEFAULT_THRESHOLD.threshold),
  slackMetres: Number(flags.slack ?? DEFAULT_THRESHOLD.slackMetres)
};
const workers = Number(flags.workers ?? 4);
const batchSize = Number(flags.batch ?? 100);

// ---- where things are: read from the checkout, so the tool asks what the application asks ----------

/** The network the trip planner reads: `developmentRoutingBaseUrl` in connections.ts. */
function defaultNetwork() {
  const connections = read('libs/aggiemap/ngx/common/src/lib/connections.ts');
  const base = connections.match(/developmentRoutingBaseUrl:\s*'([^']+)'/)?.[1];

  if (!base) fail('Could not find developmentRoutingBaseUrl in connections.ts');

  return `${base}/Map/NAServer/Route`;
}

/** The campus basemap's Structure Data layer: `TAMU_CAMPUS_BASEMAP_URL`, layer 1. */
function buildingsLayer() {
  const basemap = read('libs/common/datasets/geographic/src/lib/campus/campus-basemap.ts');
  const url = basemap.match(/TAMU_CAMPUS_BASEMAP_URL\s*=\s*'([^']+)'/)?.[1];

  if (!url) fail('Could not find TAMU_CAMPUS_BASEMAP_URL in campus-basemap.ts');

  return `${url}/1`;
}

function read(file) {
  return fs.readFileSync(path.join(REPO, file), 'utf8');
}

function fail(message) {
  console.error(`network-detour: ${message}`);
  process.exit(1);
}

// ---- requests --------------------------------------------------------------------------------------

/** A request that is retried on a transport failure or a 5xx, and never on an answer it did not like. */
async function request(url, init, attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(120_000) });

      if (response.status >= 500) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (e) {
      if (attempt >= attempts) throw new Error(`${url}: ${e.message} after ${attempts} attempts`);
      await new Promise((r) => setTimeout(r, 2000 * attempt ** 2));
    }
  }
}

/**
 * Every building with coordinates, keyed by OBJECTID. Only about half have an `Abbrev`, so a tool keyed
 * on it would cover half the campus while looking complete; `Abbrev` and the name are carried for the
 * report.
 */
async function buildings() {
  const layer = buildingsLayer();
  const where = "IsBldg='Y' AND Longitude IS NOT NULL AND Latitude IS NOT NULL";
  const all = [];

  for (let offset = 0; ;) {
    const params = new URLSearchParams({
      where,
      outFields: 'OBJECTID,Abbrev,BldgName,Longitude,Latitude',
      orderByFields: 'OBJECTID',
      resultOffset: String(offset),
      returnGeometry: 'false',
      f: 'json'
    });
    const page = await request(`${layer}/query?${params}`);

    if (page.error) fail(`${layer}: ${JSON.stringify(page.error)}`);

    for (const { attributes: a } of page.features) {
      all.push({
        id: a.OBJECTID,
        abbrev: a.Abbrev?.trim() || null,
        name: a.BldgName?.trim() || null,
        lon: a.Longitude,
        lat: a.Latitude
      });
    }

    offset += page.features.length;
    if (!page.exceededTransferLimit || !page.features.length) break;
  }

  const { count } = await request(`${layer}/query?${new URLSearchParams({ where, returnCountOnly: 'true', f: 'json' })}`);

  if (count !== all.length) fail(`${layer} counts ${count} buildings and returned ${all.length}`);

  return all;
}

/** The travel mode the service publishes under this name. A mode that has gone is a finding (#2592). */
async function travelMode() {
  const description = await request(`${network}?f=json`);
  const found = description.supportedTravelModes?.find((m) => m.name === mode);

  if (!found) {
    fail(
      `${network} does not publish the ${mode} travel mode; it publishes ${(description.supportedTravelModes ?? []).map((m) => m.name).join(', ') || 'none'}`
    );
  }

  return found;
}

/** One `/solve` for many two-stop routes, each named by its pair's key. */
function solve(pairs, byId, mode, ignoreInvalidLocations) {
  const features = pairs.flatMap((p) =>
    [p.from, p.to].map((id) => ({
      geometry: { x: byId.get(id).lon, y: byId.get(id).lat, spatialReference: { wkid: 4326 } },
      attributes: { Name: String(id), RouteName: p.key }
    }))
  );
  const body = new URLSearchParams({
    f: 'json',
    stops: JSON.stringify({ features }),
    travelMode: JSON.stringify(mode),
    returnRoutes: 'true',
    returnStops: 'false',
    returnDirections: 'false',
    outputLines: 'esriNAOutputLineNone',
    accumulateAttributeNames: 'Length',
    ignoreInvalidLocations: String(ignoreInvalidLocations)
  });

  return request(`${network}/solve`, { method: 'POST', body });
}

/**
 * One batch: a fast pass that skips what it cannot route, then each pair it skipped asked again on its
 * own with `ignoreInvalidLocations=false`, so the server says why. Every pair ends routed or explained,
 * and the batch fails if one does not.
 */
async function runBatch(pairs, byId, mode) {
  const fast = await solve(pairs, byId, mode, true);

  if (fast.error) throw new Error(`/solve failed for a batch of ${pairs.length}: ${JSON.stringify(fast.error)}`);

  const { routed, missing } = joinRoutes(pairs, fast);
  const explained = new Map();

  for (const key of missing) {
    const pair = pairs.find((p) => p.key === key);
    const alone = await solve([pair], byId, mode, false);
    const reason = noRouteReason(alone);

    if (reason) explained.set(key, reason);
    else joinRoutes([pair], alone).routed.forEach((length, k) => routed.set(k, length));
  }

  reconcile(pairs, routed, explained);

  return pairs.map((p) =>
    routed.has(p.key)
      ? { from: p.from, to: p.to, straight: p.straight, network: routed.get(p.key) }
      : { from: p.from, to: p.to, straight: p.straight, unreachable: explained.get(p.key) }
  );
}

// ---- tiers -----------------------------------------------------------------------------------------

/** Looks a building up by OBJECTID or by abbreviation. */
function find(all, wanted) {
  const found =
    all.find((b) => String(b.id) === wanted) ?? all.find((b) => b.abbrev?.toUpperCase() === wanted.toUpperCase());

  if (!found) fail(`No building with OBJECTID or abbreviation ${wanted}`);

  return found;
}

/**
 * The committed quick pairs. They are keyed by OBJECTID, which a basemap republish can renumber, so each
 * carries the abbreviation and name it had when it was added, and a pair whose building no longer matches
 * stops the run instead of quietly testing two different buildings.
 */
function quickPairs(all) {
  const byId = new Map(all.map((b) => [b.id, b]));
  const { pairs } = JSON.parse(fs.readFileSync(QUICK_PAIRS, 'utf8'));
  const stale = [];
  const chosen = [];

  for (const p of pairs) {
    const [a, b] = [byId.get(p.from.id), byId.get(p.to.id)];

    for (const [want, got] of [
      [p.from, a],
      [p.to, b]
    ]) {
      if (!got || (got.abbrev ?? null) !== (want.abbrev ?? null) || got.name !== want.name)
        stale.push(`${want.id} (${want.abbrev ?? want.name}) is now ${got ? (got.abbrev ?? got.name) : 'missing'}`);
    }

    if (a && b) chosen.push(pairOf(a, b));
  }

  const keys = chosen.map((p) => [p.from, p.to].sort((x, y) => x - y).join('-'));
  const twice = keys.filter((k, i) => keys.indexOf(k) !== i);

  if (twice.length) fail(`quick-pairs.json lists ${twice.join(', ')} more than once`);
  if (stale.length)
    fail(
      `quick-pairs.json no longer matches the basemap; re-key these by name before trusting a run:\n  ${stale.join('\n  ')}`
    );

  return chosen;
}

/**
 * A stratified sample for the quick tier: the same number of pairs in every distance band, drawn from
 * buildings with an abbreviation so a person can read the result. Seeded, so it is the same sample each
 * time it is drawn from the same buildings.
 */
function sample(all, perBand = 20, seed = 2655) {
  let state = seed;
  const random = () => (state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const named = all.filter((b) => b.abbrev);
  const wanted = new Map();

  for (let tries = 0; tries < 200000; tries++) {
    const a = named[Math.floor(random() * named.length)];
    const b = named[Math.floor(random() * named.length)];

    if (a.id === b.id) continue;

    const pair = pairOf(a, b);
    const band = bandOf(pair.straight);
    const list = wanted.get(band) ?? [];

    const same = (p) => (p.from === pair.from && p.to === pair.to) || (p.from === pair.to && p.to === pair.from);

    if (list.length < perBand && !list.some(same)) wanted.set(band, [...list, pair]);
  }

  return [...wanted.values()].flat();
}

// ---- the run ---------------------------------------------------------------------------------------

const started = new Date();
const all = await buildings();
const byId = new Map(all.map((b) => [b.id, b]));
const describe = (b) => ({ id: b.id, abbrev: b.abbrev, name: b.name });

if (tier === 'sample') {
  const pairs = sample(all).map((p) => ({
    from: describe(byId.get(p.from)),
    to: describe(byId.get(p.to)),
    why: `stratified sample, ${bandOf(p.straight)}`
  }));

  console.log(JSON.stringify({ pairs }, null, 2));
  process.exit(0);
}

let pairs;

if (tier === 'quick') pairs = quickPairs(all);
else if (tier === 'full') pairs = pairsOf(all, mode);
else if (positional.length === 2) pairs = [pairOf(find(all, positional[0]), find(all, positional[1]))];
else if (positional.length === 1) {
  const one = find(all, positional[0]);

  pairs = all.filter((b) => b.id !== one.id).map((b) => pairOf(one, b));
} else fail('one takes a building, or two');

const runId = flags.id ?? `${started.toISOString().slice(0, 10)}-${tier}-${mode}`;
const outDir = path.join(HERE, 'runs', runId);
const progressFile = path.join(outDir, 'progress.jsonl');

fs.mkdirSync(outDir, { recursive: true });

console.log(`DEVELOPMENT ONLY: ${network}. Production has no routing service, so this run tests nothing on production.`);
console.log(
  `${tier}, ${mode}: ${pairs.length} pairs among ${all.length} buildings, ${workers} workers, batches of ${batchSize}. Run: ${path.relative(REPO, outDir)}`
);

/** What an interrupted run already finished, so `full` picks up where it stopped. */
const done = new Map();

if (fs.existsSync(progressFile)) {
  for (const line of fs.readFileSync(progressFile, 'utf8').split('\n')) {
    if (!line.trim()) continue;

    try {
      for (const r of JSON.parse(line)) done.set(`${r.from}-${r.to}`, r);
    } catch {
      // A line cut off when the run was killed: its batch is simply asked again.
    }
  }
  if (done.size) console.log(`Resuming: ${done.size} pairs already measured.`);
}

const todo = pairs.filter((p) => !done.has(p.key));
const batches = [];

for (let i = 0; i < todo.length; i += batchSize) batches.push(todo.slice(i, i + batchSize));

const mode_ = await travelMode();
let next = 0;
let finished = 0;
let lastLog = Date.now();

async function worker() {
  while (next < batches.length) {
    const batch = batches[next++];
    const results = await runBatch(batch, byId, mode_);

    fs.appendFileSync(progressFile, JSON.stringify(results) + '\n');
    for (const r of results) done.set(`${r.from}-${r.to}`, r);
    finished += batch.length;

    if (Date.now() - lastLog > 60_000 || finished === todo.length) {
      lastLog = Date.now();
      const rate = finished / ((Date.now() - started) / 1000);
      const left = Math.round((todo.length - finished) / rate / 60);

      console.log(`  ${done.size}/${pairs.length} pairs, ${rate.toFixed(1)} a second, about ${left} min left`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(workers, batches.length) }, worker));

const results = pairs.map((p) => done.get(p.key));
const summary = summarize(results, all, threshold);
const elapsed = Math.round((Date.now() - started) / 1000);
const run = {
  developmentOnly: 'The routing network is published on the development GIS server only; production has no routing service.',
  network,
  tier,
  mode,
  threshold,
  started: started.toISOString(),
  elapsedSeconds: elapsed,
  buildings: all.length,
  ...summary,
  isolated: summary.isolated.map(describe).map((b, i) => ({ ...b, unreachable: summary.isolated[i].unreachable })),
  impossible: summary.impossible.map(row),
  outliers: summary.outliers.map(row),
  unreachablePairs: summary.unreachablePairs.map((u) => ({
    from: describe(u.from),
    to: describe(u.to),
    straight: Math.round(u.straight),
    reason: u.reason
  }))
};

function row(r) {
  return {
    from: describe(r.from),
    to: describe(r.to),
    straight: Math.round(r.straight),
    network: Math.round(r.network),
    excess: Math.round(r.excess),
    ratio: Number(r.ratio.toFixed(3))
  };
}

fs.writeFileSync(path.join(outDir, 'run.json'), JSON.stringify(run, null, 2) + '\n');
report(run);

if (flags.compare) compare(JSON.parse(fs.readFileSync(flags.compare, 'utf8')), run);

// ---- output ----------------------------------------------------------------------------------------

function report(run) {
  const label = (b) => (b.abbrev ? `${b.abbrev} (${b.id})` : `${b.name ?? 'unnamed'} (${b.id})`);

  console.log(`\nDEVELOPMENT ONLY. ${run.routed} of ${run.pairs} pairs routed, ${run.elapsedSeconds} s.`);
  console.log('\nBand        Pairs  Routed  Detours  Median  Worst');
  for (const b of run.bands) {
    console.log(
      `${b.band.padEnd(11)} ${String(b.pairs).padStart(5)}  ${String(b.routed).padStart(6)}  ${String(b.detours).padStart(7)}  ${fmt(b.median)}  ${fmt(b.worst)}`
    );
  }

  if (run.impossible.length) {
    console.log(
      `\nIMPOSSIBLE: ${run.impossible.length} routes shorter than the straight line. The measurement or the coordinates are wrong:`
    );
    for (const r of run.impossible.slice(0, 30))
      console.log(`  ${label(r.from)} to ${label(r.to)}: ${r.straight} m straight, ${r.network} m by network (${r.ratio})`);
  }

  console.log(
    `\nDetours (over ${run.threshold.threshold} times the straight line plus ${run.threshold.slackMetres} m): ${run.outliers.length}`
  );
  for (const r of run.outliers.slice(0, 30))
    console.log(
      `  +${r.excess} m, ${r.ratio}x: ${label(r.from)} to ${label(r.to)}, ${r.straight} m straight, ${r.network} m by network`
    );

  console.log(`\nBuildings that reach nothing: ${run.isolated.length}`);
  for (const b of run.isolated) console.log(`  ${label(b)} ${b.name ?? ''}`);

  console.log(`\nOther pairs with no route: ${run.unreachablePairs.length}`);
  for (const u of run.unreachablePairs.slice(0, 30)) console.log(`  ${label(u.from)} to ${label(u.to)}: ${u.reason}`);
}

function fmt(n) {
  return n === null ? '    -' : n.toFixed(2).padStart(5);
}

/** What changed between two runs of the same pairs: the question a network republish raises. */
function compare(before, after) {
  const keyOf = (r) => `${r.from.id}-${r.to.id}`;
  const sets = (run) => ({
    outliers: new Set(run.outliers.map(keyOf)),
    unreachable: new Set([...run.unreachablePairs.map(keyOf), ...run.isolated.map((b) => `isolated ${b.id}`)])
  });
  const [b, a] = [sets(before), sets(after)];

  console.log(`\nCompared with ${before.network} (${before.started}):`);
  for (const kind of ['outliers', 'unreachable']) {
    const added = [...a[kind]].filter((k) => !b[kind].has(k));
    const gone = [...b[kind]].filter((k) => !a[kind].has(k));

    console.log(
      `  ${kind}: ${added.length} new, ${gone.length} gone${added.length ? ` - new: ${added.slice(0, 20).join(', ')}` : ''}`
    );
  }
}
