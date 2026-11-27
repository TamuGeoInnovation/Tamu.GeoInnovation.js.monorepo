#!/usr/bin/env node
/**
 * Holds `docs/parked-code.md`, the `parked/*` tags and the `parked` issues to each other (#3657, #3704).
 *
 * Parked code lives in git history on a tag. Three things have to agree for anyone to find it: the register page,
 * the tag, and an issue naming the condition for bringing it back. A rule saying "also update the page" decays -
 * `scripts/check-gis-differences.mjs` exists because roughly fifty GIS differences accumulated under exactly such a
 * rule. So this is a check instead.
 *
 * It fails when:
 *   - a `parked/*` tag has no row in the register (the code is parked and nothing says so);
 *   - a row names a tag that does not exist (the row points at nothing, which is worse than no row);
 *   - a row has no issue reference (nothing will surface when the condition is met);
 *   - a `parked/*` tag is not annotated (so `git show` would not explain it).
 *
 * The first two have a grace period, because tags are global and a register row is not (#3717). Parking something is
 * not one atomic act: for a while either the tag exists without its row or the row exists without its tag, and during
 * that window this check would otherwise fail on every branch anybody pushed, for a reason unconnected to their
 * change. It did exactly that for 33 minutes, on its second use. So a disagreement younger than GRACE_SECONDS **warns
 * and passes**, and the same disagreement older than that fails as it did before. Catching drift is the point;
 * catching it inside the minute it is created is not.
 *
 * What the grace period does not excuse: a tag that stays unrecorded, or a row whose tag never appears. Both fail once
 * the window closes, which is the whole value of the register.
 *
 * It deliberately does NOT check that the issue is open, or that it carries the `parked` label: that needs the network,
 * and a check that fails when GitHub is unreachable would block every pull request during an outage.
 *
 * Tags must be present for this to mean anything. `lint.yml` checks out with `fetch-depth: 0`, which fetches them.
 * Run with no tags fetched at all, it says so and passes rather than reporting every row as broken.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const REGISTER = 'docs/parked-code.md';
const PREFIX = 'parked/';

/**
 * How long a tag and its row are allowed to disagree. A day is far longer than bringing the two into agreement takes
 * and far shorter than anyone would leave a park unrecorded, so it separates "being written now" from "forgotten".
 * `PARKED_GRACE_SECONDS` overrides it, which is how the tests age a fixture without faking tagger dates.
 */
const GRACE_SECONDS = (() => {
  const raw = process.env.PARKED_GRACE_SECONDS;

  // An unset variable and one set to the empty string both mean "use the default"; Number('') is 0, which would
  // silently turn the grace period off everywhere it is passed through without a value.
  if (raw === undefined || raw.trim() === '') {
    return 24 * 60 * 60;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 24 * 60 * 60;
})();

const NOW = Math.floor(Date.now() / 1000);

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** Like `git`, but `undefined` rather than a throw when the command fails or answers nothing. */
function gitOrNothing(args) {
  try {
    const out = git(args);

    return out === '' ? undefined : out;
  } catch {
    return undefined;
  }
}

/** Every `parked/*` tag, whether each is annotated, and how many seconds old each is. */
function tags() {
  const out = git([
    'for-each-ref',
    '--format=%(refname:short)\t%(objecttype)\t%(taggerdate:unix)\t%(creatordate:unix)',
    `refs/tags/${PREFIX}*`
  ]);

  if (out === '') {
    return [];
  }

  return out.split('\n').map((line) => {
    const [name, objecttype, taggerdate, creatordate] = line.split('\t');

    // An annotated tag is its own object; a lightweight one points straight at the commit.
    // A lightweight tag has no taggerdate, so fall back to the commit's date.
    const when = Number(taggerdate || creatordate || 0);

    return { name, annotated: objecttype === 'tag', ageSeconds: when > 0 ? NOW - when : 0 };
  });
}

/**
 * How many seconds ago a row for `tag` was added to the register, from the commit that introduced the line. A row
 * being written now is not yet committed, so there is nothing to find: that counts as age 0, which is inside any
 * positive grace period and outside a zero one.
 */
function rowAgeSeconds(tag) {
  const when = gitOrNothing(['log', '-1', '--format=%ct', '-S', tag, '--', REGISTER]);

  return when === undefined ? 0 : Math.max(0, NOW - Number(when));
}

/**
 * The register's rows, as `{ tag, issue }`. The table's first column is the tag in backticks and its last is the
 * issue; anything else in the row is for a reader, not for this check.
 */
function rows() {
  const text = readFileSync(REGISTER, 'utf8');
  const found = [];

  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) {
      continue;
    }

    const cells = line.split('|').slice(1, -1);

    if (cells.length < 2) {
      continue;
    }

    const tag = cells[0].trim().replace(/^`|`$/g, '');

    if (!tag.startsWith(PREFIX)) {
      continue; // the header, the separator, or a table that is not the register
    }

    found.push({ tag, issue: cells[cells.length - 1].trim(), line: line.trim() });
  }

  return found;
}

/** Seconds as a phrase a reader can act on, so a warning says how long is left rather than a bare number. */
function age(seconds) {
  if (seconds < 120) {
    return `${seconds} second${seconds === 1 ? '' : 's'} old`;
  }

  const minutes = Math.round(seconds / 60);

  return minutes < 120 ? `${minutes} minutes old` : `${Math.round(minutes / 60)} hours old`;
}

function main() {
  const problems = [];
  const warnings = [];
  const present = tags();
  const registered = rows();

  if (present.length === 0) {
    const anyTags = git(['tag', '-l']) !== '';

    if (!anyTags) {
      console.log('No tags are fetched here, so the parked register cannot be checked. Skipping.');
      return 0;
    }
  }

  const byName = new Map(present.map((t) => [t.name, t]));
  const inRegister = new Set(registered.map((r) => r.tag));

  for (const tag of present) {
    if (!inRegister.has(tag.name)) {
      const message = `${tag.name} is a parked tag with no row in ${REGISTER}. Add one, or the code it holds is findable only by someone who already knows it exists.`;

      if (tag.ageSeconds < GRACE_SECONDS) {
        warnings.push(`${message} The tag is ${age(tag.ageSeconds)}, so this is not failing yet (#3717).`);
      } else {
        problems.push(message);
      }
    }

    if (!tag.annotated) {
      problems.push(
        `${tag.name} is a lightweight tag. Parked tags are annotated so that \`git show ${tag.name}\` explains itself: re-make it with \`git tag -a\`.`
      );
    }
  }

  for (const row of registered) {
    if (!byName.has(row.tag)) {
      const message = `${REGISTER} names the tag ${row.tag}, which does not exist. Create and push it, or remove the row: a row pointing at nothing is worse than no row.`;
      const rowAge = rowAgeSeconds(row.tag);

      if (rowAge < GRACE_SECONDS) {
        warnings.push(`${message} The row is ${age(rowAge)}, so this is not failing yet (#3717).`);
      } else {
        problems.push(message);
      }
    }

    if (!/#\d+|\/issues\/\d+/.test(row.issue)) {
      problems.push(
        `${REGISTER}'s row for ${row.tag} has no issue in its last column. Without one, nothing surfaces when the condition for bringing it back is met.`
      );
    }
  }

  if (warnings.length > 0) {
    console.warn(`${REGISTER} and the parked/* tags do not agree yet, which is allowed for now:\n`);
    for (const w of warnings) {
      console.warn(`  - ${w}`);
    }
    console.warn(
      `\nFinish it: merge the row and push the tag. Once the disagreement is older than ${Math.round(
        GRACE_SECONDS / 3600
      )} hours this check fails.\n`
    );
  }

  if (problems.length > 0) {
    console.error(`${REGISTER}, the parked/* tags and their issues disagree:\n`);
    for (const p of problems) {
      console.error(`  - ${p}`);
    }
    console.error(`\nSee the "Adding an entry" section of ${REGISTER}.`);
    return 1;
  }

  console.log(
    `${REGISTER}: ${registered.length} parked ${registered.length === 1 ? 'entry' : 'entries'}, each with an annotated tag and an issue.`
  );
  return 0;
}

process.exit(main());
