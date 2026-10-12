#!/usr/bin/env node
/**
 * Fails if any installed package is a View Engine Angular library - one that only works because `ngcc`
 * rewrites it at install time (#1279, #1220).
 *
 * Angular 16 removes `ngcc`, and with it every View Engine library stops being a valid NgModule. #1220
 * removed, upgraded or replaced the five this workspace had. This keeps it that way: it runs in
 * `postinstall` in place of `ngcc`, so a new dependency that needs `ngcc` fails the install on every
 * machine and in CI, instead of quietly working until the Angular 16 upgrade refuses to build.
 *
 * A package counts as View Engine when it depends on `@angular/core` and ships `*.metadata.json`, the
 * View Engine compiler's metadata, which Ivy libraries never ship; or when it carries the marker `ngcc`
 * leaves on a package it processed. Measured against the workspace before #1220, this flags exactly the
 * five packages `ngcc` was processing and nothing else.
 *
 * Usage: node scripts/check-no-view-engine.js [node_modules directory]
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'node_modules'));

/** Top-level package directories, including scoped ones. */
function packageDirs(dir) {
  const dirs = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    const full = path.join(dir, entry.name);

    if (entry.name.startsWith('@')) {
      for (const scoped of fs.readdirSync(full, { withFileTypes: true })) {
        if (scoped.isDirectory()) {
          dirs.push(path.join(full, scoped.name));
        }
      }
    } else {
      dirs.push(full);
    }
  }

  return dirs;
}

/** Whether a package ships View Engine metadata, outside any packages nested inside it. */
function hasMetadata(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') {
      continue;
    }

    const full = path.join(dir, entry.name);

    if (entry.isDirectory() ? hasMetadata(full) : entry.name.endsWith('.metadata.json')) {
      return true;
    }
  }

  return false;
}

function readPackageJson(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
}

const offenders = [];

for (const dir of packageDirs(root)) {
  const pkg = readPackageJson(dir);

  if (!pkg) {
    continue;
  }

  const dependsOnAngular = ['dependencies', 'peerDependencies'].some((field) => pkg[field] && pkg[field]['@angular/core']);
  const processedByNgcc = Object.keys(pkg).includes('__processed_by_ivy_ngcc__');

  if (processedByNgcc || (dependsOnAngular && hasMetadata(dir))) {
    offenders.push(`${pkg.name}@${pkg.version}`);
  }
}

if (offenders.length > 0) {
  console.error(
    `These packages are View Engine Angular libraries, which need ngcc. Angular 16 removes ngcc (#1220):\n` +
      offenders.map((name) => `  - ${name}`).join('\n') +
      `\nUse a release that ships Ivy partial compilation, or replace the package. See #1279.`
  );
  process.exit(1);
}

console.log('No installed package needs ngcc.');
