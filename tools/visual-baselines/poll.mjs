/**
 * Captures each new dev and production release by itself, from its tag (#2355).
 *
 *   node tools/visual-baselines/poll.mjs --out <baselines> [--dry-run]
 *
 * Run from a checkout with its tags (the cluster's CronJob clones one every 15 minutes). It finds the
 * newest `dev-*` and `prod-*` tag, and if either has no complete set yet, and the plan below allows it
 * now, it captures that release, compares it with the previous set of the same kind, and rebuilds the
 * pages. One capture per run; the next run takes the other.
 *
 * Why tags and not the sites: a `dev-*` tag is pushed only once a build passes its quick tier, and a
 * `prod-*` tag once it is deployed, so only tested builds are photographed and each set gets its name.
 * The site's own `main-*.js` cannot be trusted to change with a build (25 October 2026).
 *
 * When not to start (decided 25 October 2026), both settings:
 *
 * - `--wait-minutes` (60): after its tag, a dev build has its release tier run on dev (step 3b of the
 *   release sequence). A capture during a smoke run spoils both, as on 6 October.
 * - `--quiet` (02:30-08:30, US Central): the nightly smoke run starts at 6:17 AM on both environments,
 *   and a capture on the cluster takes about 3.5 hours, so none starts that would still be running then.
 */

import { execFileSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** The two environments it watches, and their tag prefixes. GIS Day has no tags yet (#1525). */
export const WATCHED = [
  { environment: 'development', prefix: 'dev-' },
  { environment: 'production', prefix: 'prod-' }
];

/** How recently a set must have been written to for an unfinished one to count as being captured now. */
export const IN_PROGRESS_MINUTES = 15;

/** Minutes since midnight in US Central, for the quiet window (Intl, not TZ: #1423). */
export function centralMinutes(date) {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(date)
    .split(':')
    .map(Number);

  return h * 60 + m;
}

/** "02:30" as minutes since midnight. */
const minutesOf = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);

  return h * 60 + m;
};

/** Whether `date` falls in the quiet window "HH:MM-HH:MM" (US Central); a window may cross midnight. */
export function inQuiet(date, quiet) {
  if (!quiet) {
    return false;
  }

  const [from, until] = quiet.split('-').map(minutesOf);
  const now = centralMinutes(date);

  return from <= until ? now >= from && now < until : now >= from || now < until;
}

/**
 * A set's state from its manifest: missing, unfinished (a capture started and never finished, so it is
 * resumed), or complete. A capture that finished with some shots failed counts as complete: retrying a
 * page that keeps failing every 15 minutes would never end, and the capture's log names them.
 */
export function setState(manifest) {
  if (!manifest) {
    return 'missing';
  }

  return manifest.completedAt ? 'complete' : 'unfinished';
}

/**
 * What to do now, decided from what is known and nothing else, so it can be tested:
 *
 *   tags:  [{ environment, tag, taggedAt: Date }]   the newest tag of each watched environment
 *   sets:  { 'development/dev-2026-10-25': manifest | null, ... }
 *   lastWrites: { 'development/dev-2026-10-25': Date | null }  when anything in the set was last written
 *   running: 'development/dev-2026-10-25' | null  any set, of any kind, being captured now (runningCapture)
 *
 * Returns `{ capture: { environment, tag } | null, reasons: [string] }`: the release to capture, or
 * none, and a line for each tag saying why, for the log. The oldest tag waiting goes first.
 */
export function plan({ tags, sets, lastWrites = {}, running = null, now, waitMinutes = 60, quiet = '02:30-08:30' }) {
  const reasons = [];
  const ready = [];

  // One capture at a time on the cluster, whoever started it: two share its two workers and both slow
  // down until pages time out.
  if (running) {
    return { capture: null, reasons: [`${running} is being captured now; nothing else starts until it finishes`] };
  }

  for (const { environment, tag, taggedAt } of tags) {
    const state = setState(sets[`${environment}/${tag}`]);
    const age = (now - taggedAt) / 60000;

    const lastWrite = lastWrites[`${environment}/${tag}`];

    if (state === 'complete') {
      reasons.push(`${environment} ${tag}: captured already`);
    } else if (state === 'unfinished' && lastWrite && now - lastWrite < IN_PROGRESS_MINUTES * 60000) {
      // Someone is capturing it now (start-capture.ps1, or this poller's last run): a shot lands every
      // few seconds while a capture runs, so a set written to in the last 15 minutes is not abandoned.
      reasons.push(`${environment} ${tag}: being captured now (written ${Math.floor((now - lastWrite) / 60000)} min ago); leaving it`);
    } else if (age < waitMinutes) {
      reasons.push(`${environment} ${tag}: tagged ${Math.floor(age)} min ago; waiting until ${waitMinutes}, for its smoke runs`);
    } else {
      ready.push({ environment, tag, taggedAt, state });
    }
  }

  if (ready.length && inQuiet(now, quiet)) {
    for (const r of ready) {
      reasons.push(`${r.environment} ${r.tag}: ${r.state}, but ${quiet} Central is quiet (the nightly smoke run)`);
    }

    return { capture: null, reasons };
  }

  ready.sort((a, b) => a.taggedAt - b.taggedAt);

  for (const [i, r] of ready.entries()) {
    reasons.push(`${r.environment} ${r.tag}: ${r.state}; ${i === 0 ? 'capturing now' : 'next run'}`);
  }

  return { capture: ready[0] ? { environment: ready[0].environment, tag: ready[0].tag } : null, reasons };
}

/** The newest set of a kind other than `except`, by when it was captured, to compare a new one with. */
export function previousSet(out, environment, except) {
  const dir = path.join(out, environment);

  if (!fs.existsSync(dir)) {
    return null;
  }

  return (
    fs
      .readdirSync(dir)
      .filter((name) => name !== except)
      .map((name) => {
        try {
          return { name, manifest: JSON.parse(fs.readFileSync(path.join(dir, name, 'manifest.json'), 'utf8')) };
        } catch {
          return null;
        }
      })
      .filter((s) => s && setState(s.manifest) === 'complete')
      .sort((a, b) => b.manifest.capturedAt.localeCompare(a.manifest.capturedAt))[0]?.name || null
  );
}

/** When anything in a set folder was last written, or null if there is no folder. */
function lastWrite(dir) {
  if (!fs.existsSync(dir)) {
    return null;
  }

  let newest = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      newest = Math.max(newest, fs.statSync(path.join(entry.parentPath, entry.name)).mtimeMs);
    }
  }

  return newest ? new Date(newest) : null;
}

/**
 * A set of any kind being captured now, by anyone: unfinished, and written to in the last 15 minutes.
 * The poller has no access to the cluster's list of Jobs, so the volume is how it sees a capture that
 * start-capture.ps1 started.
 */
export function runningCapture(out, now = new Date()) {
  for (const kind of fs.existsSync(out) ? fs.readdirSync(out) : []) {
    const kindDir = path.join(out, kind);

    if (kind === 'compare' || kind === 'lost+found' || !fs.statSync(kindDir).isDirectory()) {
      continue;
    }

    for (const name of fs.readdirSync(kindDir)) {
      const dir = path.join(kindDir, name);
      const manifest = readManifest(path.join(dir, 'manifest.json'));
      const written = manifest && setState(manifest) === 'unfinished' ? lastWrite(dir) : null;

      if (written && now - written < IN_PROGRESS_MINUTES * 60000) {
        return `${kind}/${name}`;
      }
    }
  }

  return null;
}

const readManifest = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

/** The newest tag of each watched environment in this checkout, with when it was made. */
function newestTags(repo) {
  return WATCHED.map(({ environment, prefix }) => {
    const line = execFileSync('git', ['for-each-ref', '--sort=-creatordate', '--count=1', '--format=%(refname:short) %(creatordate:iso-strict)', `refs/tags/${prefix}*`], {
      cwd: repo,
      encoding: 'utf8'
    }).trim();

    if (!line) {
      return null;
    }

    const [tag, when] = line.split(' ');

    return { environment, tag, taggedAt: new Date(when) };
  }).filter(Boolean);
}

/** Runs a node script beside this one, its output shown as it goes; returns its exit status. */
const node = (script, args) => spawnSync(process.execPath, [path.join(HERE, script), ...args], { stdio: 'inherit' }).status;

function main() {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);

    return i > 0 ? process.argv[i + 1] : fallback;
  };
  const out = arg('out', '');
  const repo = path.resolve(HERE, '..', '..');

  if (!out) {
    console.error('usage: node tools/visual-baselines/poll.mjs --out <baselines> [--wait-minutes 60] [--quiet 02:30-08:30] [--dry-run]');
    process.exit(2);
  }

  const tags = newestTags(repo);
  const sets = Object.fromEntries(tags.map((t) => [`${t.environment}/${t.tag}`, readManifest(path.join(out, t.environment, t.tag, 'manifest.json'))]));
  const lastWrites = Object.fromEntries(tags.map((t) => [`${t.environment}/${t.tag}`, lastWrite(path.join(out, t.environment, t.tag))]));
  const decided = plan({ tags, sets, lastWrites, running: runningCapture(out), now: new Date(), waitMinutes: Number(arg('wait-minutes', '60')), quiet: arg('quiet', '02:30-08:30') });

  decided.reasons.forEach((reason) => console.log(reason));

  if (!decided.capture || process.argv.includes('--dry-run')) {
    return 0;
  }

  const { environment, tag } = decided.capture;
  const captured = node('capture.mjs', ['--env', environment, '--release', tag, '--out', out]);
  const previous = previousSet(out, environment, tag);

  // A comparison only of a complete capture: a partial one would list every missing page as unchanged.
  if (captured === 0 && setState(readManifest(path.join(out, environment, tag, 'manifest.json'))) === 'complete' && previous) {
    const name = `${previous}-vs-${tag}`;

    node('review.mjs', [
      path.join(out, environment, previous),
      path.join(out, environment, tag),
      path.join(out, 'compare', name, 'diff'),
      path.join(out, 'compare', name, 'index.html')
    ]);
  }

  node('index.mjs', [out]);

  return captured;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exit(main());
}
