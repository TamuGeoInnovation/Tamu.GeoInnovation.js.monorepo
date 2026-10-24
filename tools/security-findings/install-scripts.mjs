#!/usr/bin/env node
/**
 * Fails when the lock installs a package with an install script that `allowScripts` in package.json does not
 * name (#2293).
 *
 * Most malicious npm releases do their work in a `preinstall`, `install` or `postinstall` script, and npm runs
 * them during `npm ci`. `.npmrc` sets `strict-allow-scripts`, so npm 11 itself refuses to install a package
 * whose script is not reviewed - but only when `npm ci` actually runs, and CI's lint job skips it when its
 * node_modules cache hits. This reads the lock instead, which records `hasInstallScript` for every package
 * that has one, so it needs no install, runs in a second, and does not depend on the npm version.
 *
 *   node tools/security-findings/install-scripts.mjs [package.json] [package-lock.json]
 *
 * Exit 0 when every package with a script is listed (allowed or denied), 1 when one is not, 2 when an input
 * cannot be read. `allowScripts` is maintained with `npm install-scripts approve|deny`; see the README.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The package's name from its lock key: the part after the last `node_modules/`. */
export const nameOf = (key) => key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);

/**
 * Every package in the lock with an install script: `{ name, version, key }`, sorted, one per name and
 * version. The root project (key "") is not a dependency, so its own scripts are not part of the policy.
 */
export function withInstallScripts(lock) {
  const seen = new Map();

  for (const [key, entry] of Object.entries(lock?.packages ?? {})) {
    if (key === '' || !entry?.hasInstallScript) {
      continue;
    }

    const name = nameOf(key);
    seen.set(`${name}@${entry.version}`, { name, version: entry.version, key });
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name) || String(a.version).localeCompare(b.version));
}

/** Splits an `allowScripts` key into its name and the exact versions it pins, if any (`pkg`, `pkg@1.2.3`, `pkg@1 || 2`). */
export function parseEntry(entry) {
  const at = entry.lastIndexOf('@');

  if (at <= 0) {
    return { name: entry, versions: null };
  }

  return {
    name: entry.slice(0, at),
    versions: entry
      .slice(at + 1)
      .split('||')
      .map((v) => v.trim())
  };
}

/** The packages with install scripts that no `allowScripts` entry covers, and the entries nothing installs any more. */
export function uncovered(allowScripts, packages, installed) {
  const entries = Object.keys(allowScripts ?? {}).map((key) => ({ key, ...parseEntry(key) }));
  const covers = (entry, pkg) =>
    entry.name === pkg.name && (entry.versions === null || entry.versions.includes(pkg.version));
  const unmatched = entries.filter((entry) => !packages.some((pkg) => covers(entry, pkg)));

  // An entry whose package is installed but has no recorded script is not stale (#2326): npm's strict-allow-scripts
  // also counts a binding.gyp as `install: node-gyp rebuild`, even with "gypfile": false, and the lock does not record
  // that. better-sqlite3 13 is one. Without `installed`, every unmatched entry is stale, as before.
  const isInstalled = (entry) => installed?.includes(entry.name) ?? false;

  return {
    missing: packages.filter((pkg) => !entries.some((entry) => covers(entry, pkg))),
    unused: unmatched.filter((entry) => !isInstalled(entry)).map((entry) => entry.key),
    noScript: unmatched.filter(isInstalled).map((entry) => entry.key)
  };
}

/** Every package the lock installs, by name, at any depth; not the project itself. */
export const installedNames = (lock) => [
  ...new Set(
    Object.keys(lock?.packages ?? {})
      .filter((key) => key !== '')
      .map(nameOf)
  )
];

function main([packagePath = 'package.json', lockPath = 'package-lock.json']) {
  let manifest, lock;

  try {
    manifest = JSON.parse(readFileSync(packagePath, 'utf8'));
    lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch (error) {
    console.error(`install-scripts: cannot read ${packagePath} or ${lockPath}: ${error.message}`);
    return 2;
  }

  const packages = withInstallScripts(lock);
  const { missing, unused, noScript } = uncovered(manifest.allowScripts, packages, installedNames(lock));

  console.log(
    `${packages.length} package(s) in the lock have install scripts; ${packages.length - missing.length} are in allowScripts.`
  );

  // Not a failure: an entry for a package that has gone allows nothing.
  if (unused.length) {
    console.log(`Not installed any more, so these entries can go (npm install-scripts prune): ${unused.join(', ')}`);
  }

  // Not stale either: npm may still treat the package's binding.gyp as an install script (#2326).
  if (noScript.length) {
    console.log(
      `Installed, but no install script recorded in the lock; npm may still treat a binding.gyp as one, so these stay: ${noScript.join(', ')}`
    );
  }

  if (missing.length) {
    console.log('');
    console.log('Not reviewed - these packages run an install script that allowScripts in package.json does not name:');
    missing.forEach((pkg) => console.log(`  ${pkg.name}@${pkg.version} (${pkg.key})`));
    console.log('');
    console.log('Read what each script does, then allow it (npm install-scripts approve --no-allow-scripts-pin <name>)');
    console.log('or deny it (npm install-scripts deny <name>). See tools/security-findings/README.md.');
    return 1;
  }

  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
