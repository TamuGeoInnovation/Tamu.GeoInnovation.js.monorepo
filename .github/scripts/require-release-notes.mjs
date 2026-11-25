#!/usr/bin/env node
/**
 * Fails a pull request that changes something a user can see and adds no release-notes entry (#1264).
 *
 * CLAUDE.md asks every pull request with a user-visible result to add one file to
 * `docs/releases/unreleased/`, in the same pull request. #1263 enforced the template's image checklist
 * and left this one, in the same template, unchecked; on 1 October five visible changes merged and none
 * added an entry, so the notes had to be rebuilt from the commit log at release time.
 *
 * "User-visible" is decided exactly as the screenshots check decides it, by importing its rule, so the
 * two checks cannot disagree about which pull requests they apply to. The escape hatch is the same
 * label, `no-visible-change`, for the same reason: a human's deliberate act, visible afterwards.
 */

import { fileURLToPath } from 'node:url';

import { isUserVisible } from './require-screenshots.mjs';

/** An entry file: added under docs/releases/unreleased/, not its README. */
export function isEntry({ status, filename }) {
  return (
    ['added', 'renamed', 'copied'].includes(status) &&
    /^docs\/releases\/unreleased\/[^/]+\.md$/.test(filename) &&
    !/\/README\.md$/i.test(filename)
  );
}

/** `files` are `{ status, filename }`, as GitHub lists a pull request's files. */
export function evaluate({ files, labels }) {
  const visible = files.map((f) => f.filename).filter(isUserVisible);

  if (visible.length === 0) {
    return { ok: true, reason: 'no user-visible files changed' };
  }

  if (labels.some((l) => l.toLowerCase() === 'no-visible-change')) {
    return { ok: true, reason: 'labelled no-visible-change' };
  }

  const entries = files.filter(isEntry).map((f) => f.filename);
  if (entries.length) {
    return { ok: true, reason: `adds ${entries.join(', ')}` };
  }

  return { ok: false, reason: 'user-visible change with no release-notes entry', visible };
}

/** Proves the detector both ways on every run: a check that silently stops detecting reads as a pass. */
const add = (filename) => ({ status: 'added', filename });
const mod = (filename) => ({ status: 'modified', filename });
const CASES = [
  { name: 'template change, no entry -> fails', input: { files: [mod('libs/a/x.component.html')], labels: [] }, ok: false },
  { name: 'template change with an entry -> passes', input: { files: [mod('libs/a/x.component.html'), add('docs/releases/unreleased/1264-notes-check.md')], labels: [] }, ok: true },
  { name: 'template change with the label -> passes', input: { files: [mod('libs/a/x.component.html')], labels: ['no-visible-change'] }, ok: true },
  { name: 'an edited entry is not a new one -> fails', input: { files: [mod('libs/a/x.component.scss'), mod('docs/releases/unreleased/1-old.md')], labels: [] }, ok: false },
  { name: 'the README is not an entry -> fails', input: { files: [mod('libs/a/x.component.ts'), add('docs/releases/unreleased/README.md')], labels: [] }, ok: false },
  { name: 'a file in a subfolder is not an entry -> fails', input: { files: [mod('libs/a/x.directive.ts'), add('docs/releases/unreleased/x/1-a.md')], labels: [] }, ok: false },
  { name: 'unreleased.md itself does not count -> fails', input: { files: [mod('apps/b/src/styles.scss'), mod('docs/releases/unreleased.md')], labels: [] }, ok: false },
  { name: 'service change only -> passes', input: { files: [mod('libs/a/x.service.ts')], labels: [] }, ok: true },
  { name: 'spec file only -> passes', input: { files: [mod('libs/a/x.component.spec.ts')], labels: [] }, ok: true },
  { name: 'workflow only -> passes', input: { files: [mod('.github/workflows/x.yml')], labels: [] }, ok: true }
];

export function selfTest() {
  let failures = 0;
  for (const c of CASES) {
    const got = evaluate(c.input).ok;
    if (got !== c.ok) failures++;
    console.log(`${got === c.ok ? 'ok  ' : 'FAIL'} ${c.name}`);
  }
  return failures;
}

// Only when this file is the one being run: the release-notes check imports it (#1264), and must not run this one's cases.
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === '--self-test') {
  process.exit(selfTest() === 0 ? 0 : 1);
}
