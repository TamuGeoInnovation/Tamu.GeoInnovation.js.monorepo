import * as fs from 'fs';
import * as path from 'path';

import { DEFINITIONS_DIR, DEFINITIONS_PREFIX, parseDefinition } from './definitions';

/**
 * Choosing which of the suite to run for a given change (#1427).
 *
 * The full suite is 757 tests and about an hour and a half, and it gates every release. A change to
 * one map's definitions cannot affect the other sixty-eight, so running all of them to clear it is
 * waste. This works out which routes a set of changed files can affect.
 *
 * **It fails open, always.** Anything this module does not confidently understand means "run
 * everything". The dangerous failure for a tool like this is the quiet one - a mapping that misses a
 * dependency and silently stops testing something - so the only mappings here are ones that cannot
 * be wrong, and the list grows as mappings are proven rather than guessed.
 *
 * **A scoped run does not replace the scheduled full run.** The suite exists because maps break
 * *without* a release: a hosted GIS service is republished or moved and no commit is involved.
 * Scoping by what was touched cannot see that by definition. The daily run against dev and
 * production keeps running everything, and CLAUDE.md says so.
 */

/**
 * Specs that must run whatever changed, because their titles carry no route to match on and they
 * guard the suite itself rather than one map.
 */
export const ALWAYS_RUN_SPECS = [
  'analytics.spec.ts',
  'build-banner.spec.ts',
  'development-only.spec.ts',
  'esri-runtime.spec.ts',
  'mobile.spec.ts',
  'paint.spec.ts',
  'retired.spec.ts'
];

/**
 * Titles that must run whatever changed but live in a spec that is mostly per-route, so the spec
 * cannot be named wholesale without dragging its route tests along.
 *
 * `maps.spec.ts` holds the coverage floor, which is what notices a map disappearing from the
 * discovery pages instead of silently not being tested.
 */
export const ALWAYS_RUN_TITLES = ['lists at least'];

/** Paths that cannot change what a deployed map does, so they neither scope nor force a full run. */
const IGNORABLE = [/^docs\//, /\.md$/, /^\.github\/ISSUE_TEMPLATE\//];

export interface Scope {
  /** Routes the change can affect, e.g. `/events/mens-basketball`. */
  routes: string[];
  /** False when something changed that this module cannot map, which means run everything. */
  scopable: boolean;
  /** Why, in a sentence, for the run's output. */
  reason: string;
}

function isIgnorable(file: string): boolean {
  return IGNORABLE.some((pattern) => pattern.test(file));
}

/**
 * Work out the scope for a set of repository-relative changed files.
 *
 * `readFile` is injected so this can be tested without touching the definitions directory.
 */
export function scopeForChangedFiles(
  changed: string[],
  readFile: (file: string) => string = (file) => fs.readFileSync(path.join(DEFINITIONS_DIR, file), 'utf8')
): Scope {
  if (changed.length === 0) {
    return { routes: [], scopable: false, reason: 'nothing changed against the base, so nothing could be narrowed' };
  }

  const routes: string[] = [];

  for (const file of changed) {
    if (isIgnorable(file)) {
      continue;
    }

    if (!file.startsWith(DEFINITIONS_PREFIX) || !file.endsWith('.definitions.ts')) {
      return {
        routes: [],
        scopable: false,
        reason: `${file} is not a map definition, and nothing maps it to routes, so the whole suite runs`
      };
    }

    const name = file.slice(DEFINITIONS_PREFIX.length);
    const parsed = parseDefinition(name, readFile(name));

    if (!parsed) {
      return {
        routes: [],
        scopable: false,
        reason: `${name} declares no EventConfiguration, so the routes it affects could not be read`
      };
    }

    if (!routes.includes(parsed.route)) {
      routes.push(parsed.route);
    }
  }

  if (routes.length === 0) {
    return {
      routes: [],
      scopable: true,
      reason: 'nothing that reaches a deployed map changed, so only the checks that always run are needed'
    };
  }

  return {
    routes,
    scopable: true,
    reason: `only ${routes.join(', ')} can be affected`
  };
}

/** Escape a route for use inside a regular expression. */
function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The `--grep` pattern for a scope: its routes, plus the titles that always run and cannot be
 * selected by naming a spec file.
 */
export function grepFor(scope: Scope): string {
  return [...scope.routes.map(escape), ...ALWAYS_RUN_TITLES.map(escape)].join('|');
}
