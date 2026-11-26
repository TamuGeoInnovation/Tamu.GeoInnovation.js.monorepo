#!/usr/bin/env bash
# Tests scripts/check-format.mjs's rules (#3586): which files it checks, how it splits them into batches, what it says
# about an implausibly long list, and how it gathers Prettier's results across batches. No network; runs in a second.
# The repository has no host node, so this runs node directly where there is one (CI, a container) and in Docker
# otherwise.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp "$here/check-format.mjs" "$tmp/check.mjs"
cat >"$tmp/run.mjs" <<'JS'
import { isChecked, changedFiles, batches, baseNote, behindDevelopment, listDifferent, BATCH, BATCH_CHARS, IMPLAUSIBLE } from './check.mjs';

const many = (n) => Array.from({ length: n }, (_, i) => `file-${i}.ts`);

// A fake Prettier: it reports `bad.ts` as different (exit 1, as Prettier does), and fails outright on a batch
// containing `boom.ts`.
const prettier = (batch) => {
  if (batch.includes('boom.ts')) return { status: 249, stdout: '', stderr: 'spawn E2BIG\n' };
  const different = batch.filter((f) => f === 'bad.ts');
  return { status: different.length ? 1 : 0, stdout: different.join('\n'), stderr: '' };
};

const noteFor = (count, base, behind) => baseNote(count, base, behind).join(' ');

const cases = [
  // What is checked at all (#3503), unchanged by this work.
  ['Markdown is not checked', !isChecked('CLAUDE.md') && !isChecked('docs/a.markdown')],
  ['code, styles and config are checked', isChecked('a.ts') && isChecked('a.scss') && isChecked('a.json')],
  ['only files that still exist are listed', changedFiles('base', () => 'a.ts\nb.md\n  \nc.scss\n').join(',') === 'a.ts,c.scss'],

  // Batching: one command line holding every file in the repository dies before reading anything.
  ['a short list is one batch', batches(many(5)).length === 1],
  ['a list is split into runs of at most BATCH', batches(many(BATCH * 2 + 1)).length === 3],
  ['every file appears exactly once across the batches', batches(many(450)).flat().length === 450],
  ['the batch size is well under a command-line limit', BATCH <= 500],
  // Either limit alone can be the wrong one, so both are enforced (#3586).
  ['a batch is also closed by its character budget', batches(many(BATCH).map((f) => `${'d/'.repeat(60)}${f}`)).length > 1],
  ['no batch is longer than the character budget', batches(many(500).map((f) => `${'d/'.repeat(60)}${f}`)).every((b) => b.join(' ').length <= BATCH_CHARS)],
  ['a single path longer than the budget is still checked, alone', batches(['x'.repeat(BATCH_CHARS * 2), 'a.ts']).length === 2],
  ['an empty list makes no batches', batches([]).length === 0],

  // The note on an implausible list: the count, the base, and how far behind it is - the number that gives it away.
  ['the note names the count and the base', noteFor(8331, 'origin/development', 0).includes('8331 file(s) changed since origin/development')],
  ['the note says the base is the first thing to suspect', noteFor(8331, 'x', 0).includes('base is the first thing to suspect')],
  ['the note gives the distance behind development when there is one', noteFor(8331, 'x', 1096).includes('1096 commit(s) behind origin/development')],
  ['the note leaves the distance out when the base is development itself', !noteFor(8331, 'origin/development', 0).includes('behind origin/development.')],
  ['the note says the check still runs', noteFor(8331, 'x', 1096).includes('Checking all of them anyway')],
  ['a repository-wide format is over the threshold too, so the note must not refuse', IMPLAUSIBLE > 0 && IMPLAUSIBLE < 8331],

  // Gathering results across batches.
  ['a formatted list passes', (() => { const r = listDifferent(many(300), prettier); return r.unformatted.length === 0 && r.failed === null; })()],
  ['an unformatted file is reported whichever batch it is in', (() => { const r = listDifferent([...many(250), 'bad.ts'], prettier); return r.unformatted.join(',') === 'bad.ts' && r.failed === null; })()],
  ['Prettier exiting 1 for a difference is not a failure to run', listDifferent(['bad.ts'], prettier).failed === null],
  ['a batch that fails outright is reported with its status', (() => { const f = listDifferent(['boom.ts'], prettier).failed; return f !== null && f.status === 249; })()],
  // A batch that fails reports nothing about its own files - Prettier never looked at them - but it must not cost us
  // the verdicts the other batches did produce.
  ['a failing batch does not hide what the other batches found', (() => { const r = listDifferent([...many(BATCH - 1), 'bad.ts', 'boom.ts'], prettier); return r.unformatted.includes('bad.ts') && r.failed !== null && r.failed.index === 1; })()],
  ['a batch Prettier could not be started for is reported as that', (() => { const f = listDifferent(['a.ts'], () => ({ error: new Error('no npx') })).failed; return f !== null && f.message === 'no npx'; })()],

  // The distance is read from git, and an unanswerable question is not an error.
  ['the distance behind development is read from git', behindDevelopment('x', () => '1096\n') === 1096],
  ['development is zero behind itself without asking git', behindDevelopment('origin/development', () => { throw new Error('should not be asked'); }) === 0],
  ['a base git cannot resolve gives null, not a crash', behindDevelopment('nope', () => { throw new Error('unknown revision'); }) === null]
];

let failed = 0;
for (const [name, ok] of cases) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`); if (!ok) failed++; }
console.log(`${cases.length - failed} of ${cases.length} passed.`);
process.exit(failed ? 1 : 0);
JS
if command -v node >/dev/null 2>&1; then (cd "$tmp" && node run.mjs); else MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd "$tmp" && pwd -W 2>/dev/null || pwd):/t" -w /t node:24.22.1 node run.mjs; fi
