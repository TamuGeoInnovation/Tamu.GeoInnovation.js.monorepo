#!/usr/bin/env node
/**
 * Fails a pull request whose title does not follow `type(project-name): Short description` (#1274).
 *
 * CONTRIBUTING.md has asked for that format for years, and nothing checked it. The squash merge makes the
 * title the commit's first line on `development`, so a title is the one piece of a pull request that stays in
 * `git log` for good, and the history is filtered by its type and project.
 *
 * The rule is the one the repository actually follows: of the last 300 merged pull requests on 24 November
 * 2026, 299 matched it. The project in brackets may be left out when a change spans the workspace, as
 * CONTRIBUTING.md allows; it is not checked against the list of Nx projects, because `workspace`, `deps` and
 * `scripts` are used on purpose and are not projects.
 */

import { fileURLToPath } from 'node:url';

/** The types in use: CONTRIBUTING.md's four, and the conventional ones this repository also uses. */
export const TYPES = ['fix', 'feat', 'chore', 'ci', 'docs', 'test', 'refactor', 'perf', 'build', 'style', 'revert'];

const PATTERN = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9][a-z0-9-]*(, ?[a-z0-9][a-z0-9-]*)*\\))?!?: \\S.*$`);

/** `{ ok, reason }` for a pull request title. */
export function checkTitle(title) {
  const text = (title ?? '').trim();

  if (PATTERN.test(text)) {
    return { ok: true, reason: 'the title follows type(project-name): Short description' };
  }

  const type = text.match(/^([A-Za-z]+)/)?.[1];
  if (type && !TYPES.includes(type) && TYPES.includes(type.toLowerCase())) {
    return { ok: false, reason: `the type is written "${type}"; use lower case, "${type.toLowerCase()}"` };
  }
  if (!type || !TYPES.includes(type)) {
    return { ok: false, reason: `the title does not start with one of: ${TYPES.join(', ')}` };
  }
  return { ok: false, reason: 'after the type comes an optional (project-name), then a colon, a space and the description' };
}

/** Proves the rule both ways on every run: a check that silently stops detecting reads as a pass. */
const CASES = [
  ['fix(aggiemap-angular): The garage search reads Campus Structures', true],
  ['feat(gisday-platform-ngx-core): The admin Speakers list shows sessions', true],
  ['chore(deps): bump the everything-else group with 2 updates', true],
  ['ci(workspace): A workflow runs every scripts/*.test.sh', true],
  ['docs: The wrong bash in PowerShell reads as an expired GitHub key', true],
  ['refactor(gisday-platform-ngx-core, gisday-platform-ngx-common): One template', true],
  ['feat!: A breaking change', true],
  ['Fix the map', false],
  ['Fix(aggiemap-angular): Upper-case type', false],
  ['fix(aggiemap-angular) The map', false],
  ['fix(AggieMap): A capital in the project', false],
  ['fix(aggiemap-angular):', false],
  ['update stuff', false],
  ['', false]
];

export function selfTest() {
  let failures = 0;
  for (const [title, expected] of CASES) {
    const got = checkTitle(title).ok;
    if (got !== expected) failures++;
    console.log(`${got === expected ? 'ok  ' : 'FAIL'} ${expected ? 'passes' : 'fails '}: ${JSON.stringify(title)}`);
  }
  return failures;
}

// Only when this file is the one being run, so another check can import it without running these cases.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--self-test') {
    process.exit(selfTest() === 0 ? 0 : 1);
  }

  const result = checkTitle(process.env.TITLE);
  if (result.ok) {
    console.log(`Pass: ${result.reason}.`);
    process.exit(0);
  }

  console.error(
    [
      '',
      `This pull request's title does not follow the repository's format: ${result.reason}.`,
      '',
      `  ${process.env.TITLE ?? ''}`,
      '',
      'Titles are `type(project-name): Short description` (CONTRIBUTING.md), for example',
      '  fix(aggiemap-angular): The garage search reads Campus Structures',
      `Types: ${TYPES.join(', ')}. The (project-name) may be left out for a workspace-wide change.`,
      'The squash merge makes the title the commit on development, so it stays in the history for good.',
      'Edit the title; this check runs again on the edit.',
      ''
    ].join('\n')
  );
  process.exit(1);
}
