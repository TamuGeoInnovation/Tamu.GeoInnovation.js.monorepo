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
 * **Each library is held to its own count, of its own errors (#3718).** Three rules, so that strict-library pull requests
 * on different libraries never invalidate each other, and can merge in any order with no re-count:
 *
 * - **Only errors in the library's own files count:** paths under its project root, plus any error tsc reports with no
 *   file (a configuration error is the library's own). An error in a library it imports is that library's, so making
 *   another library strict cannot change this library's count.
 * - **The count lives beside the library's own configuration,** in `<project root>/strict-errors-known.txt`: one number,
 *   with `#` comments for why. A library with no such file is held to zero. Pull requests on different libraries never
 *   touch the same file.
 * - **Only a count going up fails.** A lower count, or a library now clean, is a notice saying the file can come down or
 *   go; the next change to that library takes it.
 *
 *   node scripts/check-strict-libs.mjs --all --write   measures every strict library and writes, or deletes, each file
 *
 * Runs as a lint.yml step (one line, so scripts/check-in-volume.sh runs it too).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { errorsIn, projectRootOf } from './check-spec-types.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The file that holds a library's count of its own known errors, beside its `tsconfig.lib.json` (#3718). */
export const KNOWN_FILE = 'strict-errors-known.txt';

/**
 * How many of the errors in tsc's output <out> are <projectRoot>'s own: those in a file it owns, and any with no file.
 * A file is owned by the nearest project root above it (<ownerOf>, `projectRootOf` by default), so a project nested in
 * another's folder (ui-kits-ngx-layout-code in ui-kits-ngx-layout) keeps its own errors. A continuation line of a
 * message is not an error; paths are compared with `/`, whatever the platform wrote.
 */
export function ownErrors(out, projectRoot, ownerOf = projectRootOf) {
  const root = projectRoot.replace(/\\/g, '/').replace(/\/$/, '');
  let count = 0;
  for (const line of out.split('\n')) {
    const error = line.match(/^(?:(.+?)\(\d+,\d+\): )?error TS\d+/);
    if (!error) continue;
    const file = error[1]?.replace(/\\/g, '/');
    if (file === undefined || (file.startsWith(`${root}/`) && ownerOf(file)?.replace(/\\/g, '/') === root)) count++;
  }
  return count;
}

/** A library's known count from its `strict-errors-known.txt` <text>: the first number on a line, or undefined. */
export function readOwnKnown(text) {
  for (const line of text.split('\n')) {
    const m = line
      .replace(/#.*/, '')
      .trim()
      .match(/^(\d+)$/);
    if (m) return Number(m[1]);
  }
  return undefined;
}

/**
 * What a library's own <count> means against its <known> count (undefined: none known, so zero). `fail` only when it
 * went up; `notice`, when it came down, says what the file can become (#3718).
 */
export function verdict(count, known) {
  const held = known ?? 0;
  if (count > held) {
    return {
      fail: true,
      message:
        known === undefined
          ? `${count} type error(s) in its own files`
          : `${count} type error(s) in its own files, up from ${known} in its ${KNOWN_FILE}`,
      notice: null
    };
  }
  if (known !== undefined && count < known) {
    return {
      fail: false,
      message: null,
      notice:
        count === 0
          ? `now type-checks cleanly: its ${KNOWN_FILE} can be deleted (it had ${known})`
          : `${count} type error(s): its ${KNOWN_FILE} can come down to ${count} (from ${known})`
    };
  }
  return { fail: false, message: null, notice: null };
}

function knownFor(root) {
  const file = join(ROOT, root, KNOWN_FILE);
  return existsSync(file) ? readOwnKnown(readFileSync(file, 'utf8')) : undefined;
}

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
  const write = process.argv.includes('--write');
  const base = process.env.BASE || 'origin/development';
  const configs = all ? allConfigs() : changedConfigs(base);

  if (write && !all) {
    console.error('--write measures every strict library, so it needs --all.');
    process.exit(2);
  }

  if (configs.length === 0) {
    console.log(`No strict library changed since ${base}; nothing to type-check.`);
    process.exit(0);
  }

  let failed = 0;
  for (const config of configs) {
    const root = dirname(config);
    const { out } = errorsIn(config);
    const count = ownErrors(out, root);
    const known = knownFor(root);

    if (write) {
      const file = join(ROOT, root, KNOWN_FILE);
      if (count > 0) {
        writeFileSync(
          file,
          `# Type errors in this library's own files under its tsconfig.lib.json, held so they cannot rise (#3581, #3718).\n` +
            `# Errors in the libraries it imports are theirs, not counted here. Re-measure with:\n` +
            `#   node scripts/check-strict-libs.mjs --all --write\n${count}\n`
        );
      } else if (existsSync(file)) {
        rmSync(file);
      }
      console.log(`${count > 0 ? 'wrote ' : 'clean '} ${config}: ${count} in its own files`);
      continue;
    }

    const v = verdict(count, known);
    if (!v.fail) {
      console.log(`ok    ${config}${known !== undefined ? ` (${count} in its own files, held at ${known})` : ''}`);
      if (v.notice) console.log(`      notice: ${v.notice}`);
      continue;
    }

    failed++;
    console.log(`FAIL  ${config}: ${v.message}`);
    const prefix = `${root.replace(/\\/g, '/')}/`;
    console.log(
      out
        .split('\n')
        .filter((l) => /error TS\d+/.test(l) && (!/^\S.*\(\d+,\d+\): /.test(l) || l.replace(/\\/g, '/').startsWith(prefix)))
        .slice(0, 20)
        .map((l) => `        ${l}`)
        .join('\n')
    );
  }

  if (failed) {
    console.error(
      `\n${failed} strict library configuration(s) have more errors in their own files than they are held at. Nothing else compiles a library with its own configuration (#3581).`
    );
    process.exit(1);
  }
  console.log(`\n${configs.length} strict library configuration(s) ${write ? 'measured' : 'checked'}.`);
}
