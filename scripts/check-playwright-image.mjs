#!/usr/bin/env node
/**
 * Fails when a tracked file hard-codes a Playwright Docker image whose version is not the one
 * `package-lock.json` records (#3301).
 *
 * The supported path already follows the lock by itself: `test/smoke/aggiemap/run-local.sh` and
 * `scripts/capture-screenshot.sh` read `@playwright/test`'s version out of the lock and build the image
 * name from it. What rots is the hand-written `docker run` example in a README - the thing somebody
 * reaches for when they want one capture rather than a suite. On 23 November 2026 the testing group's
 * Dependabot pull request moved Playwright to 1.65.1 and four READMEs went on naming v1.64.1-noble, so
 * every command a reader copied failed with "Please update docker image as well". Nothing noticed; it was
 * found by hand, hours later, while capturing images for #3225.
 *
 * CLAUDE.md already names this as the known follow-up to a Playwright bump ("A fix it needs, for example
 * the READMEs that hard-code a Playwright image version, is its own small pull request"). This is so that
 * the next bump says so itself, in the pull request that makes it wrong, rather than a week later.
 *
 * Run from the repository root:
 *
 *   node scripts/check-playwright-image.mjs
 *
 * Only literal versions are matched, so a command that
 * derives the version from the lock is left alone - that is the pattern this check wants to encourage.
 * `bash scripts/check-playwright-image.test.sh` tests it.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** A literal image reference: mcr.microsoft.com/playwright:v1.65.1-noble. Not one built from a variable. */
const IMAGE = /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)(-[a-z0-9.]+)?/g;

/** Files that are not text, or are too big to be a command example. */
const SKIP = /\.(png|jpg|jpeg|gif|webp|ico|pdf|zip|woff2?|ttf|eot|mp4|svg)$/i;

/** Directories with nothing hand-written in them, and far too much of it to read. */
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage', 'tmp', '.nx', '.angular', 'test-results']);

function lockedVersion() {
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const entry = lock.packages?.['node_modules/@playwright/test'];
  if (!entry?.version) {
    throw new Error('package-lock.json does not record a version for @playwright/test');
  }
  return entry.version;
}

/**
 * Walked rather than taken from `git ls-files`, because a worktree's `.git` is a file pointing at the
 * parent repository: inside the Docker container that `scripts/check-in-volume.sh` and every local run
 * use, only the worktree is mounted, so git cannot read it and the check would die rather than check.
 * Nearly every branch here is worked in a worktree, so that is the normal case, not the odd one.
 */
function textFiles(dir = '.') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = dir === '.' ? entry.name : join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...textFiles(path));
    } else if (entry.isFile() && !SKIP.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

const want = lockedVersion();
const wrong = [];

for (const file of textFiles()) {
  if (SKIP.test(file)) continue;
  let text;
  try {
    if (statSync(file).size > 2 * 1024 * 1024) continue;
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (!text.includes('mcr.microsoft.com/playwright:v')) continue;
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(IMAGE)) {
      if (m[1] !== want) wrong.push({ file, line: i + 1, found: m[1], text: line.trim() });
    }
  });
}

if (wrong.length === 0) {
  console.log(`Every hard-coded Playwright image names v${want}, as package-lock.json does.`);
  process.exit(0);
}

for (const w of wrong) {
  console.log(
    `::error file=${w.file},line=${w.line}::This names Playwright v${w.found}, but package-lock.json records ` +
      `v${want}, so the command fails for whoever copies it. Change it to ` +
      `mcr.microsoft.com/playwright:v${want}-noble, or derive the version from the lock as ` +
      `test/smoke/aggiemap/run-local.sh does.`
  );
  console.log(`  ${w.file}:${w.line}  ${w.text}`);
}
console.log(
  `\n${wrong.length} hard-coded Playwright image reference${wrong.length === 1 ? '' : 's'} ` +
    `disagree${wrong.length === 1 ? 's' : ''} with package-lock.json (v${want}).`
);
process.exit(1);
