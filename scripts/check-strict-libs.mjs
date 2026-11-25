#!/usr/bin/env node
/**
 * Type-checks the library configuration of every strict project a branch changes, and fails on a type error there
 * (#3581).
 *
 *   node scripts/check-strict-libs.mjs             compares with $BASE, or origin/development
 *   node scripts/check-strict-libs.mjs --all       every strict library, to measure or to refresh the known failures
 *
 * Why. A library with no `build` target is never compiled with its own `tsconfig.lib.json`: apps compile it with their
 * settings, `nx lint` does not type-check, and scripts/check-spec-types.mjs checks only `tsconfig.spec.json`. So a
 * library that turns on `strict` or `strictNullChecks` could stop compiling under its own rules with nothing to say so:
 * on 25 November 2026 `common-utils-string` had 2 such errors (#3553 after #3495), found only by accident.
 *
 * A library is strict when its `tsconfig.lib.json`, or a configuration it extends inside its own project (usually the
 * project's `tsconfig.json`), sets `strict` or `strictNullChecks` to true; the nearest setting wins, as in TypeScript.
 * The workspace's `tsconfig.base.json` is outside every project and sets neither to true.
 *
 * The strict libraries that already fail are listed in `scripts/strict-lib-errors-known.txt`, each with its count then,
 * held to it as scripts/check-spec-types.mjs holds its list: a listed library that now type-checks cleanly fails until
 * it is taken off, and one with more errors than its count fails too.
 *
 * Runs as a lint.yml step (one line, so scripts/check-in-volume.sh runs it too).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { errorsIn, judge, projectRootOf, readKnown } from './check-spec-types.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KNOWN = join(ROOT, 'scripts', 'strict-lib-errors-known.txt');
const LIST = { file: 'scripts/strict-lib-errors-known.txt', what: 'its library configuration' };

/** A tsconfig's text as an object: TypeScript allows comments and trailing commas, which JSON.parse does not. */
export function parseConfig(text) {
  const noComments = text.replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (whole, string) => string ?? '');
  return JSON.parse(noComments.replace(/,(\s*[}\]])/g, '$1'));
}

/**
 * Whether <config> (a repository path) is strict: `strictNullChecks`, or else `strict`, from the nearest configuration
 * that sets it, following `extends` while it stays inside <projectRoot>.
 */
export function isStrict(config, projectRoot, read = (p) => readFileSync(join(ROOT, p), 'utf8')) {
  // As TypeScript merges them: each option from the nearest configuration that sets it, and an explicit
  // strictNullChecks over strict wherever each is set.
  const seen = new Set();
  let current = config;
  let strictNullChecks;
  let strict;

  while (current && !seen.has(current)) {
    seen.add(current);
    const parsed = parseConfig(read(current));
    const options = parsed.compilerOptions ?? {};

    strictNullChecks ??= options.strictNullChecks;
    strict ??= options.strict;

    const base = parsed.extends;
    if (typeof base !== 'string' || !base.startsWith('.')) break;

    const next = normalize(join(dirname(current), base.endsWith('.json') ? base : `${base}.json`)).replace(/\\/g, '/');
    if (relative(projectRoot, next).startsWith('..')) break;

    current = next;
  }

  return (strictNullChecks ?? strict) === true;
}

function strictLibConfigOf(root) {
  const config = `${root}/tsconfig.lib.json`;
  return existsSync(join(ROOT, config)) && isStrict(config, root) ? config : null;
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
    const config = root && strictLibConfigOf(root);
    if (config) configs.add(config);
  }
  return [...configs].sort();
}

function allConfigs() {
  return execFileSync('git', ['ls-files', '**/tsconfig.lib.json'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map((config) => strictLibConfigOf(dirname(config)))
    .filter(Boolean)
    .sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = process.argv.includes('--all');
  const base = process.env.BASE || 'origin/development';
  const known = readKnown(existsSync(KNOWN) ? readFileSync(KNOWN, 'utf8') : '');
  const configs = all ? allConfigs() : changedConfigs(base);

  if (configs.length === 0) {
    console.log(`No strict library changed since ${base}; nothing to type-check.`);
    process.exit(0);
  }

  let failed = 0;
  for (const config of configs) {
    const { count, out } = errorsIn(config);
    const verdict = judge(config, count, known, LIST);
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
      `\n${failed} strict library configuration(s) failed. Nothing else compiles a library with its own configuration (#3581).`
    );
    process.exit(1);
  }
  console.log(`\n${configs.length} strict library configuration(s) checked.`);
}
