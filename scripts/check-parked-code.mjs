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

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** Every `parked/*` tag, and whether each is annotated. */
function tags() {
  const out = git(['for-each-ref', '--format=%(refname:short)\t%(objecttype)', `refs/tags/${PREFIX}*`]);

  if (out === '') {
    return [];
  }

  return out.split('\n').map((line) => {
    const [name, objecttype] = line.split('\t');

    // An annotated tag is its own object; a lightweight one points straight at the commit.
    return { name, annotated: objecttype === 'tag' };
  });
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

function main() {
  const problems = [];
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
      problems.push(
        `${tag.name} is a parked tag with no row in ${REGISTER}. Add one, or the code it holds is findable only by someone who already knows it exists.`
      );
    }

    if (!tag.annotated) {
      problems.push(
        `${tag.name} is a lightweight tag. Parked tags are annotated so that \`git show ${tag.name}\` explains itself: re-make it with \`git tag -a\`.`
      );
    }
  }

  for (const row of registered) {
    if (!byName.has(row.tag)) {
      problems.push(
        `${REGISTER} names the tag ${row.tag}, which does not exist. Create and push it, or remove the row: a row pointing at nothing is worse than no row.`
      );
    }

    if (!/#\d+|\/issues\/\d+/.test(row.issue)) {
      problems.push(
        `${REGISTER}'s row for ${row.tag} has no issue in its last column. Without one, nothing surfaces when the condition for bringing it back is met.`
      );
    }
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
