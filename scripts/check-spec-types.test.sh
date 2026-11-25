#!/usr/bin/env bash
# Tests scripts/check-spec-types.mjs's rules (#2263): how it reads the known-failures list, how it finds the project a
# file belongs to, and what each result means. No network; runs in a second. The repository has no host node, so this
# runs node directly where there is one (CI, a container) and in Docker otherwise.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp "$here/check-spec-types.mjs" "$tmp/check.mjs"
cat >"$tmp/run.mjs" <<'JS'
import { readKnown, projectRootOf, judge } from './check.mjs';
const known = readKnown('# a comment\n881 libs/ts/events/ngx/tsconfig.spec.json\n\n4 libs/gisday/common/tsconfig.spec.json  # note\n');
const exists = (p) => ['libs/gisday/common/project.json', 'apps/gisday-angular/project.json'].includes(p);
const cases = [
  ['the list is read, comments and blank lines ignored', known.size === 2 && known.get('libs/ts/events/ngx/tsconfig.spec.json') === 881 && known.get('libs/gisday/common/tsconfig.spec.json') === 4],
  ['a file belongs to the nearest folder with a project.json', projectRootOf('libs/gisday/common/src/lib/x.ts', exists) === 'libs/gisday/common'],
  ['a file in an app belongs to the app', projectRootOf('apps/gisday-angular/src/main.ts', exists) === 'apps/gisday-angular'],
  ['a file in no project belongs to none', projectRootOf('docs/x.md', exists) === null],
  ['an unlisted project with no errors is ok', judge('a/tsconfig.spec.json', 0, known) === 'ok'],
  ['an unlisted project with errors fails', judge('a/tsconfig.spec.json', 3, known).startsWith('3 type error(s)')],
  ['a listed project at or under its count is ok', judge('libs/gisday/common/tsconfig.spec.json', 4, known) === 'ok' && judge('libs/gisday/common/tsconfig.spec.json', 2, known) === 'ok'],
  ['a listed project over its count fails', judge('libs/gisday/common/tsconfig.spec.json', 5, known).includes('up from the 4')],
  ['a listed project now clean fails until it is taken off the list', judge('libs/gisday/common/tsconfig.spec.json', 0, known).includes('take it off')],
];
let failed = 0;
for (const [name, ok] of cases) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`); if (!ok) failed++; }
process.exit(failed ? 1 : 0);
JS
if command -v node >/dev/null 2>&1; then (cd "$tmp" && node run.mjs); else MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd "$tmp" && pwd -W 2>/dev/null || pwd):/t" -w /t node:24.22.1 node run.mjs; fi
