#!/usr/bin/env node
/**
 * Fails when a file this branch changed is not formatted by the repository's Prettier (#1449).
 *
 * Nothing in CI checked formatting, so files drifted: 241 on 5 October, 433 on 24 November. Reformatting all of them
 * at once would conflict with every branch in flight, so the maintainer chose (24 November, 2A) to check **only the
 * files a branch changes**: formatting stops getting worse at once, and the drift is fixed file by file as each is
 * touched. A file a branch only deletes is not checked; a file Prettier cannot format, or that `.prettierignore`
 * names, is skipped by `--ignore-unknown`.
 *
 * The base is `$BASE` (lint.yml passes the pull request's), or `origin/development`, which is what
 * `scripts/check-in-volume.sh` compares against when it runs this step. Fixing it is one command, which the failure
 * prints.
 *
 * **Prettier is run in batches, and an implausible list says so** (#3586). A wrong base makes this check compare against
 * the wrong commit, and then every file in the repository counts as changed: on 24 and 25 November 2026 a fork compared
 * against its own `development`, 1,096 commits behind, and this handed Prettier 8,331 paths instead of 6. One command
 * line that long dies, and the step printed `Prettier failed (exit 249)` - naming Prettier and a formatting fault when
 * the truth was that no file had been looked at. 119 runs failed that way in 24 hours and for a day they read as
 * somebody's formatting. #3557 fixed the base in the workflows; these two guards belong here, because the base can be
 * wrong again (a new fork, an unexpected `origin`, another workflow change) and a check that cannot run must never look
 * like a check that failed.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Markdown is not checked (#3503). Prettier pads every Markdown table to equal column widths, and the repository's
 * Markdown (CLAUDE.md, docs/, the release notes) is written with compact tables by hand: a three-line edit to
 * CLAUDE.md became a 121-line diff of padding (PR 3502). Code, JSON, YAML and styles are still checked.
 */
export function isChecked(file) {
  return !/\.(md|markdown)$/i.test(file);
}

/** The files changed between `base` and HEAD that still exist (added, copied, modified or renamed) and are checked. */
export function changedFiles(base, run = (args) => execFileSync('git', args, { encoding: 'utf8' })) {
  const out = run(['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`]);
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(isChecked);
}

/**
 * How many paths go to Prettier at once, and how many characters of them. One command line holding every file in the
 * repository is longer than the operating system allows, and the process dies before reading anything (#3586):
 * measured on 25 November 2026, the 5,226 non-Markdown files between a stale fork `development` and `development`
 * came to **351,483 characters**, against Windows' command-line limit of 32,767. Both limits are here because either
 * one alone can be wrong - 200 of this repository's deepest paths are over 30,000 characters, and a character budget
 * on its own would allow a single batch of many thousands of short names.
 */
export const BATCH = 100;

/** The character budget for one batch's paths, a quarter of Windows' 32,767, leaving room for the command itself. */
export const BATCH_CHARS = 8000;

/**
 * More changed files than any pull request here plausibly touches. Past this the base is the first thing to suspect,
 * so the run says so - but it still runs, because a deliberate repository-wide format (#3498) is over it too.
 */
export const IMPLAUSIBLE = 500;

/** `files` in runs of at most `size` paths and `maxChars` characters, and never fewer than one path per run. */
export function batches(files, size = BATCH, maxChars = BATCH_CHARS) {
  const out = [];
  let run = [];
  let chars = 0;

  for (const file of files) {
    if (run.length > 0 && (run.length >= size || chars + file.length + 1 > maxChars)) {
      out.push(run);
      run = [];
      chars = 0;
    }
    run.push(file);
    chars += file.length + 1;
  }

  if (run.length > 0) out.push(run);
  return out;
}

/**
 * What to say before checking an implausibly long list: the count, the base it came from, and how far that base is
 * behind `origin/development`, which is the number that gives the fault away.
 */
export function baseNote(count, base, behind) {
  const lines = [
    `${count} file(s) changed since ${base}, which is far more than a pull request here usually touches.`,
    'The base is the first thing to suspect: when it is the wrong commit, every file in the repository counts as changed.'
  ];
  if (behind !== null && behind > 0) {
    lines.push(
      `${base} is ${behind} commit(s) behind origin/development. Merge the latest development into this branch, or` +
        ' point the base at the base repository, and the count should drop to the files you actually changed.'
    );
  }
  lines.push('Checking all of them anyway, in batches, in case the list is right.');
  return lines;
}

/** How many commits `base` is behind `origin/development`, or null when that cannot be answered. */
export function behindDevelopment(base, run = (args) => execFileSync('git', args, { encoding: 'utf8' })) {
  if (base === 'origin/development') return 0;
  try {
    return Number.parseInt(run(['rev-list', '--count', `${base}..origin/development`]).trim(), 10);
  } catch {
    return null;
  }
}

/**
 * Runs Prettier over every batch and gathers the results: the files it reports as different, the first batch that
 * failed outright, and that batch's exit status. A batch that fails does not stop the others, so one failure cannot
 * hide the unformatted files in the rest.
 */
export function listDifferent(files, run) {
  const unformatted = [];
  let failed = null;

  for (const [index, batch] of batches(files).entries()) {
    const result = run(batch);
    if (result.error) return { unformatted, failed: { index, message: result.error.message } };

    for (const line of (result.stdout ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean))
      unformatted.push(line);

    // Prettier exits 1 when files differ, which --list-different has already told us; anything else is a real failure.
    if (result.status !== 0 && result.status !== 1 && failed === null) {
      failed = { index, status: result.status, stderr: result.stderr ?? '' };
    }
  }

  return { unformatted, failed };
}

function main() {
  const base = process.env.BASE || 'origin/development';
  const files = changedFiles(base);

  if (files.length === 0) {
    console.log(`No files changed since ${base}; nothing to check.`);
    return 0;
  }

  if (files.length > IMPLAUSIBLE) {
    console.error(['', ...baseNote(files.length, base, behindDevelopment(base)), ''].join('\n'));
  }

  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const { unformatted, failed } = listDifferent(files, (batch) =>
    spawnSync(npx, ['prettier', '--list-different', '--ignore-unknown', ...batch], { encoding: 'utf8' })
  );

  if (failed !== null) {
    if (failed.message !== undefined) {
      console.error(`Could not run Prettier: ${failed.message}`);
      return 1;
    }
    process.stderr.write(failed.stderr);
    console.error(
      `Prettier itself failed (exit ${failed.status}) on batch ${failed.index + 1} of ` +
        `${batches(files).length}, checking the ${files.length} file(s) changed since ${base}. ` +
        'This is Prettier failing to run, not a formatting fault: nothing above is a verdict on any file.'
    );
    return 1;
  }

  if (unformatted.length === 0) {
    console.log(`${files.length} changed file(s) since ${base}: every one Prettier formats is formatted.`);
    return 0;
  }

  console.error(
    [
      '',
      `${unformatted.length} file(s) this branch changed are not formatted by the repository's Prettier:`,
      ...unformatted.map((file) => `  ${file}`),
      '',
      'Format them and commit the result:',
      `  npx prettier --write ${unformatted.join(' ')}`,
      '',
      'Only the files a branch changes are checked (#1449), so a file that had drifted before is formatted the first',
      'time something touches it.',
      ''
    ].join('\n')
  );
  return 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
