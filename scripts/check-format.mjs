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

function main() {
  const base = process.env.BASE || 'origin/development';
  const files = changedFiles(base);

  if (files.length === 0) {
    console.log(`No files changed since ${base}; nothing to check.`);
    return 0;
  }

  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(npx, ['prettier', '--list-different', '--ignore-unknown', ...files], { encoding: 'utf8' });

  if (result.error) {
    console.error(`Could not run Prettier: ${result.error.message}`);
    return 1;
  }

  const unformatted = (result.stdout ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (result.status === 0 && unformatted.length === 0) {
    console.log(`${files.length} changed file(s) since ${base}: every one Prettier formats is formatted.`);
    return 0;
  }

  if (unformatted.length === 0) {
    process.stderr.write(result.stderr ?? '');
    console.error(`Prettier failed (exit ${result.status}) on the files changed since ${base}.`);
    return 1;
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
