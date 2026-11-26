#!/usr/bin/env bash
# Tests scripts/check-strict-libs.mjs's rules (#3581, #3718): how it reads a tsconfig, when a library counts as strict,
# that it counts only errors in the library's own files, reads each library's count from beside its own configuration,
# and treats a lower count as a notice and only a higher one as a failure. No network; runs in a second. The repository
# has no host node, so this runs node directly where there is one (CI, a container) and in Docker otherwise.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp "$here/check-strict-libs.mjs" "$tmp/check.mjs"
cp "$here/check-spec-types.mjs" "$tmp/check-spec-types.mjs"
cat >"$tmp/run.mjs" <<'JS'
import { parseConfig, isStrict, ownErrors, readOwnKnown, verdict } from './check.mjs';
import { judge, readKnown } from './check-spec-types.mjs';

// tsc's output for libs/m: two errors in its own files, three in a library it imports, one with no file at all.
const tscOut = [
  "libs/m/src/lib/a.ts(3,5): error TS2322: Type 'string' is not assignable to type 'number'.",
  "libs/m/src/lib/b/c.ts(10,1): error TS2531: Object is possibly 'null'.",
  "libs/mx/src/lib/d.ts(1,1): error TS2322: a library whose name starts with m's, which is not m",
  "libs/shared/src/e.ts(4,4): error TS2345: Argument of type 'x' is not assignable.",
  "libs/shared/src/f.ts(5,5): error TS18048: 'y' is possibly 'undefined'.",
  "error TS5023: Unknown compiler option 'x'.",
  "  libs/m/src/lib/a.ts(3,5): the continuation line of a message, not an error"
].join('\n');

// Which project owns a file here: libs/m, libs/mx or libs/shared, as projectRootOf would find their project.json.
const ownerOf = (file) => file.match(/^(libs\/[^/]+)\//)?.[1] ?? null;

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

const cases = [
  ['a tsconfig with comments and trailing commas is read', parseConfig(files['libs/a/tsconfig.lib.json']).compilerOptions.outDir === 'x'],
  ['a // inside a string is kept', parseConfig('{ "a": "http://x" }').a === 'http://x'],
  ['strict in the tsconfig.json it extends makes a library strict', isStrict('libs/a/tsconfig.lib.json', 'libs/a', read) === true],
  ['its own strictNullChecks wins over the base it extends', isStrict('libs/b/tsconfig.lib.json', 'libs/b', read) === true],
  ['its own strictNullChecks: false wins over a strict base', isStrict('libs/c/tsconfig.lib.json', 'libs/c', read) === false],
  ['a base outside the project does not count', isStrict('libs/d/tsconfig.lib.json', 'libs/d', read) === false],
  ['an extends without .json is followed', isStrict('libs/e/tsconfig.lib.json', 'libs/e', read) === true],
  ['strictNullChecks in a base beats strict: false nearer, as in TypeScript', isStrict('libs/f/tsconfig.lib.json', 'libs/f', read) === true],
  // #3718, rule 1: only the library's own errors count, so making another library strict cannot change this count.
  ['only errors in the library\'s own files count, and a file-less error is its own', ownErrors(tscOut, 'libs/m', ownerOf) === 3],
  // libs/mx's own: its one file and the file-less error, none of libs/m's two.
  ['a library whose folder name only starts the same is not its own', ownErrors(tscOut, 'libs/mx', ownerOf) === 2],
  ['Windows separators in tsc\'s paths are read as /', ownErrors('libs\\m\\src\\a.ts(1,1): error TS2322: x', 'libs/m', ownerOf) === 1],
  // A project nested inside another's folder is its own project (ui-kits-ngx-layout-code inside ui-kits-ngx-layout):
  // a file belongs to the nearest project root above it, as projectRootOf finds it.
  [
    'a nested project\'s errors are its own, not the outer library\'s',
    ownErrors(
      'libs/m/code/src/a.ts(1,1): error TS2345: x\nlibs/m/src/b.ts(1,1): error TS2345: y',
      'libs/m',
      (file) => (file.startsWith('libs/m/code/') ? 'libs/m/code' : 'libs/m')
    ) === 1
  ],
  // #3718, rule 2: a library's count is kept beside its own tsconfig.lib.json.
  ['a library\'s own count file is read, comments and all', readOwnKnown('# 3 in its own files (#3718)\n3\n') === 3],
  ['an empty or missing count file means none is known', readOwnKnown('') === undefined && readOwnKnown('# only a note\n') === undefined],
  // #3718, rule 3: a lower count, or a clean library, is a notice; only a higher count fails.
  ['an unlisted library with errors fails', verdict(2, undefined).fail === true],
  ['an unlisted clean library passes, with no notice', verdict(0, undefined).fail === false && verdict(0, undefined).notice === null],
  ['a library over its count fails', verdict(10, 9).fail === true && verdict(10, 9).message.includes('up from 9')],
  ['a library at its count passes, with no notice', verdict(9, 9).fail === false && verdict(9, 9).notice === null],
  ['a library under its count passes, and says the count can come down', verdict(4, 9).fail === false && verdict(4, 9).notice.includes('can come down to 4')],
  ['a library now clean passes, and says its count file can go', verdict(0, 9).fail === false && verdict(0, 9).notice.includes('can be deleted')],
  ['the spec check still names its own list', judge('libs/m/tsconfig.lib.json', 0, known).includes('scripts/spec-type-errors-known.txt')],
];
let failed = 0;
for (const [name, ok] of cases) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`); if (!ok) failed++; }
process.exit(failed ? 1 : 0);
JS
if command -v node >/dev/null 2>&1; then (cd "$tmp" && node run.mjs); else MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd "$tmp" && pwd -W 2>/dev/null || pwd):/t" -w /t node:24.22.1 node run.mjs; fi
