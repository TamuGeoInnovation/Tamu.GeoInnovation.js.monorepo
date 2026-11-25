#!/usr/bin/env node
/**
 * Type-checks the spec configuration of every project a branch changes, and fails on a type error there (#2263).
 *
 *   node scripts/check-spec-types.mjs             compares with $BASE, or origin/development
 *   node scripts/check-spec-types.mjs --all       every project, to measure or to refresh the known failures
 *
 * Why. Vitest and Jest transpile specs without type-checking them, `nx lint` does not type-check, and builds use the
 * app and library configurations, never `tsconfig.spec.json`. So a spec could be wrong about its types and still pass:
 * on 25 November 2026, 16 of 95 spec configurations had 3,993 errors between them, and nothing had said so.
 *
 * Every project is checked when the branch changes a file in it, not every project on every pull request: one
 * `tsc -p` is a few seconds to a minute, and 95 of them would make every pull request wait for all of them.
 *
 * The projects that already fail are listed in `scripts/spec-type-errors-known.txt`, each with its count then, so a
 * branch that touches one is not blamed for errors it did not write. Two things keep that list honest: a listed project
 * that now type-checks cleanly fails the check until it is taken off the list, and a listed project with more errors
 * than its count fails too. So the list can only shrink.
 *
 * Runs as a lint.yml step (one line, so scripts/check-in-volume.sh runs it too).
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KNOWN = join(ROOT, 'scripts', 'spec-type-errors-known.txt');

/** `<count> <tsconfig.spec.json path>` lines, comments and blanks ignored, as a Map of path to count. */
export function readKnown(text) {
  const known = new Map();
  for (const line of text.split('\n')) {
    const m = line
      .replace(/#.*/, '')
      .trim()
      .match(/^(\d+)\s+(\S+)$/);
    if (m) known.set(m[2], Number(m[1]));
  }
  return known;
}

/** The project root holding <file>: the nearest folder above it with a project.json, or null. */
export function projectRootOf(file, exists = (p) => existsSync(join(ROOT, p))) {
  let dir = dirname(file);
  while (dir && dir !== '.' && dir !== '/') {
    if (exists(join(dir, 'project.json'))) return dir;
    dir = dirname(dir);
  }
  return null;
}

/**
 * What a project's result means: 'ok', or a reason to fail. <list> names the known-failures file and what is checked, for
 * scripts/check-strict-libs.mjs, which holds its own list the same way (#3581).
 */
export function judge(config, errors, known, list = { file: 'scripts/spec-type-errors-known.txt', what: 'its specs' }) {
  if (!known.has(config)) {
    return errors === 0 ? 'ok' : `${errors} type error(s) in ${list.what}`;
  }
  const was = known.get(config);
  if (errors === 0) {
    return `now type-checks cleanly: take it off ${list.file} (it had ${was})`;
  }
  if (errors > was) {
    return `${errors} type error(s), up from the ${was} it is listed with`;
  }
  return 'ok';
}

/** `tsc -p <config> --noEmit`: how many errors, and its output. */
export function errorsIn(config) {
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const r = spawnSync(npx, ['tsc', '-p', config, '--noEmit'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  return { count: (out.match(/error TS\d+/g) ?? []).length, out };
}

function changedConfigs(base) {
  const files = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`], {
    cwd: ROOT,
    encoding: 'utf8'
  })
    .split('\n')
    .filter(Boolean);
  const configs = new Set();
  for (const file of files) {
    const root = projectRootOf(file);
    if (root && existsSync(join(ROOT, root, 'tsconfig.spec.json'))) configs.add(`${root}/tsconfig.spec.json`);
  }
  return [...configs].sort();
}

function allConfigs() {
  return execFileSync('git', ['ls-files', '**/tsconfig.spec.json'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = process.argv.includes('--all');
  const base = process.env.BASE || 'origin/development';
  const known = readKnown(existsSync(KNOWN) ? readFileSync(KNOWN, 'utf8') : '');
  const configs = all ? allConfigs() : changedConfigs(base);

  if (configs.length === 0) {
    console.log(`No project with a spec configuration changed since ${base}; nothing to type-check.`);
    process.exit(0);
  }

  let failed = 0;
  for (const config of configs) {
    const { count, out } = errorsIn(config);
    const verdict = judge(config, count, known);
    if (verdict === 'ok') {
      console.log(`ok    ${config}${known.has(config) ? ` (${count}, listed with ${known.get(config)})` : ''}`);
    } else {
      failed++;
      console.log(`FAIL  ${config}: ${verdict}`);
      if (!known.has(config) || count > known.get(config)) {
        console.log(
          out
            .split('\n')
            .filter((l) => /error TS\d+/.test(l))
            .slice(0, 20)
            .map((l) => `        ${l}`)
            .join('\n')
        );
      }
    }
  }

  if (failed) {
    console.error(
      `\n${failed} spec configuration(s) failed. Type errors in a spec are real errors: vitest runs specs without checking their types (#2263).`
    );
    process.exit(1);
  }
  console.log(`\n${configs.length} spec configuration(s) checked.`);
}
