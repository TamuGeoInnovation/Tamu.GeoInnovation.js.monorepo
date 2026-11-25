#!/usr/bin/env bash
# Tests scripts/check-strict-libs.mjs's rules (#3581): how it reads a tsconfig, when a library counts as strict, and that
# its known-failures list is judged as scripts/check-spec-types.mjs judges its own. No network; runs in a second. The
# repository has no host node, so this runs node directly where there is one (CI, a container) and in Docker otherwise.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp "$here/check-strict-libs.mjs" "$tmp/check.mjs"
cp "$here/check-spec-types.mjs" "$tmp/check-spec-types.mjs"
cat >"$tmp/run.mjs" <<'JS'
import { parseConfig, isStrict } from './check.mjs';
import { judge, readKnown } from './check-spec-types.mjs';

// Configurations by repository path, as isStrict reads them.
const files = {
  'libs/a/tsconfig.json': '{ "extends": "../../tsconfig.base.json", "compilerOptions": { "strict": true } }',
  'libs/a/tsconfig.lib.json': '{\n  // a comment\n  "extends": "./tsconfig.json",\n  "compilerOptions": { "outDir": "x", },\n}',
  'libs/b/tsconfig.lib.json': '{ "extends": "./tsconfig.json", "compilerOptions": { "strictNullChecks": true } }',
  'libs/b/tsconfig.json': '{ "compilerOptions": { "strict": false } }',
  'libs/c/tsconfig.lib.json': '{ "extends": "./tsconfig.json", "compilerOptions": { "strictNullChecks": false } }',
  'libs/c/tsconfig.json': '{ "compilerOptions": { "strict": true } }',
  'libs/d/tsconfig.lib.json': '{ "extends": "./tsconfig.json" }',
  'libs/d/tsconfig.json': '{ "extends": "../../tsconfig.base.json" }',
  'tsconfig.base.json': '{ "compilerOptions": { "strict": true } }',
  'libs/e/tsconfig.lib.json': '{ "extends": "./tsconfig" }',
  'libs/e/tsconfig.json': '{ "compilerOptions": { "strictNullChecks": true } }',
  'libs/f/tsconfig.lib.json': '{ "extends": "./tsconfig.json", "compilerOptions": { "strict": false } }',
  'libs/f/tsconfig.json': '{ "compilerOptions": { "strictNullChecks": true } }'
};
const read = (p) => files[p];
const known = readKnown('# a note\n9 libs/m/tsconfig.lib.json\n');
const list = { file: 'scripts/strict-lib-errors-known.txt', what: 'its library configuration' };

const cases = [
  ['a tsconfig with comments and trailing commas is read', parseConfig(files['libs/a/tsconfig.lib.json']).compilerOptions.outDir === 'x'],
  ['a // inside a string is kept', parseConfig('{ "a": "http://x" }').a === 'http://x'],
  ['strict in the tsconfig.json it extends makes a library strict', isStrict('libs/a/tsconfig.lib.json', 'libs/a', read) === true],
  ['its own strictNullChecks wins over the base it extends', isStrict('libs/b/tsconfig.lib.json', 'libs/b', read) === true],
  ['its own strictNullChecks: false wins over a strict base', isStrict('libs/c/tsconfig.lib.json', 'libs/c', read) === false],
  ['a base outside the project does not count', isStrict('libs/d/tsconfig.lib.json', 'libs/d', read) === false],
  ['an extends without .json is followed', isStrict('libs/e/tsconfig.lib.json', 'libs/e', read) === true],
  ['strictNullChecks in a base beats strict: false nearer, as in TypeScript', isStrict('libs/f/tsconfig.lib.json', 'libs/f', read) === true],
  ['an unlisted library with errors fails, named as a library', judge('libs/x/tsconfig.lib.json', 2, known, list) === '2 type error(s) in its library configuration'],
  ['a listed library over its count fails', judge('libs/m/tsconfig.lib.json', 10, known, list).includes('up from the 9')],
  ['a listed library now clean names this list', judge('libs/m/tsconfig.lib.json', 0, known, list).includes('scripts/strict-lib-errors-known.txt')],
  ['the spec check still names its own list', judge('libs/m/tsconfig.lib.json', 0, known).includes('scripts/spec-type-errors-known.txt')],
];
let failed = 0;
for (const [name, ok] of cases) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`); if (!ok) failed++; }
process.exit(failed ? 1 : 0);
JS
if command -v node >/dev/null 2>&1; then (cd "$tmp" && node run.mjs); else MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd "$tmp" && pwd -W 2>/dev/null || pwd):/t" -w /t node:24.22.1 node run.mjs; fi
