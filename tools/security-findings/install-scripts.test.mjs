/**
 * The check behind `strict-allow-scripts` (#2293): a package with an install script that `allowScripts` does
 * not name must fail, and one it names, allowed or denied, must not.
 *
 * Run by `tools-tests.yml` with `node --test 'tools/**\/*.test.mjs'`. The lock is a fixture in the shape npm 11
 * writes, with `hasInstallScript` on the packages that have one.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { nameOf, parseEntry, uncovered, withInstallScripts } from './install-scripts.mjs';

const LOCK = {
  lockfileVersion: 3,
  packages: {
    '': { name: 'tamu-gisc', hasInstallScript: true },
    'node_modules/esbuild': { version: '0.28.2', hasInstallScript: true },
    'node_modules/@swc/core': { version: '1.16.18', hasInstallScript: true },
    'node_modules/vite/node_modules/esbuild': { version: '0.25.0', hasInstallScript: true },
    'node_modules/browser-tabs-lock': { version: '1.3.0', hasInstallScript: true },
    'node_modules/left-pad': { version: '1.3.0' }
  }
};

test('names a package from its lock key, scoped or nested', () => {
  assert.equal(nameOf('node_modules/esbuild'), 'esbuild');
  assert.equal(nameOf('node_modules/@swc/core'), '@swc/core');
  assert.equal(nameOf('node_modules/vite/node_modules/esbuild'), 'esbuild');
});

test('lists every installed package with a script, each version once, and not the project itself', () => {
  assert.deepEqual(
    withInstallScripts(LOCK).map((pkg) => `${pkg.name}@${pkg.version}`),
    ['@swc/core@1.16.18', 'browser-tabs-lock@1.3.0', 'esbuild@0.25.0', 'esbuild@0.28.2']
  );
});

test('reads name-only, pinned and multi-version entries', () => {
  assert.deepEqual(parseEntry('esbuild'), { name: 'esbuild', versions: null });
  assert.deepEqual(parseEntry('@swc/core'), { name: '@swc/core', versions: null });
  assert.deepEqual(parseEntry('@swc/core@1.16.18'), { name: '@swc/core', versions: ['1.16.18'] });
  assert.deepEqual(parseEntry('esbuild@0.25.0 || 0.28.2'), { name: 'esbuild', versions: ['0.25.0', '0.28.2'] });
});

test('passes when every package with a script is allowed or denied', () => {
  const allow = { '@swc/core': true, esbuild: true, 'browser-tabs-lock': false };

  assert.deepEqual(uncovered(allow, withInstallScripts(LOCK)).missing, []);
});

test('fails on a package with a script that no entry names: a new dependency', () => {
  const allow = { '@swc/core': true, esbuild: true };

  assert.deepEqual(
    uncovered(allow, withInstallScripts(LOCK)).missing.map((pkg) => pkg.name),
    ['browser-tabs-lock']
  );
});

test('fails on a version a pinned entry does not name: an upgrade of a reviewed package', () => {
  const allow = { '@swc/core': true, 'esbuild@0.28.2': true, 'browser-tabs-lock': false };

  assert.deepEqual(
    uncovered(allow, withInstallScripts(LOCK)).missing.map((pkg) => `${pkg.name}@${pkg.version}`),
    ['esbuild@0.25.0']
  );
});

test('fails on everything when there is no allowScripts at all', () => {
  assert.equal(uncovered(undefined, withInstallScripts(LOCK)).missing.length, 4);
});

test('reports, without failing, an entry nothing installs any more', () => {
  const allow = { '@swc/core': true, esbuild: true, 'browser-tabs-lock': false, 'gone-package': true };
  const result = uncovered(allow, withInstallScripts(LOCK));

  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.unused, ['gone-package']);
});
