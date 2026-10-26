import { test } from 'node:test';
import assert from 'node:assert/strict';
import { targets, behind, auditCounts, projectOf, fromKnip, latestTable, vulnerabilityTable } from './tables.mjs';

const now = new Date('2026-10-26T12:00:00Z');

test('the target is the newest stable release at least 7 days old', () => {
  const time = {
    created: '2020-01-01T00:00:00Z',
    '1.0.0': '2026-01-01T00:00:00Z',
    '1.1.0': '2026-10-18T00:00:00Z', // 8 days
    '1.2.0': '2026-10-24T00:00:00Z', // 2 days: too new
    '2.0.0-rc.1': '2026-09-01T00:00:00Z', // a prerelease is never a target
  };
  assert.deepEqual(targets(time, now), { eligible: '1.1.0', newest: '1.2.0' });
});

test('a backport published later does not beat a higher version', () => {
  const time = { '4.2.3': '2026-10-01T00:00:00Z', '3.1.9': '2026-10-02T00:00:00Z' };
  assert.equal(targets(time, now).eligible, '4.2.3');
});

test("nothing above the registry's latest tag is a target", () => {
  const time = { '24.0.0': '2026-10-01T00:00:00Z', '9999.0.1': '2026-01-01T00:00:00Z' };
  assert.equal(targets(time, now, 7, '24.0.0').eligible, '24.0.0');
});

test('how far behind', () => {
  assert.equal(behind('1.2.3', '1.2.3'), 'current');
  assert.equal(behind('1.2.3', '1.2.4'), 'patch');
  assert.equal(behind('1.2.3', '1.3.0'), 'minor');
  assert.equal(behind('1.2.3', '2.0.0'), 'major');
  assert.equal(behind('2.0.0', '1.9.9'), 'current');
});

test("audit counts come from npm's own totals", () => {
  assert.deepEqual(auditCounts({ metadata: { vulnerabilities: { high: 2, low: 1 } } }), { critical: 0, high: 2, moderate: 0, low: 1 });
});

test('a file belongs to the deepest project that contains it', () => {
  const roots = ['libs/maps', 'libs/maps/feature/highlight'];
  assert.equal(projectOf('libs/maps/feature/highlight/src/a.ts', roots), 'libs/maps/feature/highlight');
  assert.equal(projectOf('libs/maps/src/b.ts', roots), 'libs/maps');
  assert.equal(projectOf('libs/mapsx/c.ts', roots), '(workspace)');
});

test('knip: files in either report shape, and unused dependencies', () => {
  const r = fromKnip({ files: ['a.ts'], issues: [{ file: 'b.ts', files: [{ name: 'b.ts' }] }, { file: 'package.json', dependencies: [{ name: 'x' }], devDependencies: ['y'] }] });
  assert.deepEqual(r.files, ['a.ts', 'b.ts']);
  assert.deepEqual(r.deps.map((d) => d.name), ['x', 'y']);
});

test('a High that is not accepted is flagged, an accepted one names its issue', () => {
  const all = {
    metadata: { vulnerabilities: { high: 2 } },
    vulnerabilities: {
      a: { severity: 'high', via: [{ source: 1, title: 'A' }], fixAvailable: false },
      b: { severity: 'high', via: [{ source: 2, title: 'B' }], fixAvailable: { name: 'b', version: '2.0.0', isSemVerMajor: true } },
    },
  };
  const accepted = { accepted: [{ id: '1', package: 'a', reason: 'r', issue: 'https://x/issues/7' }] };
  const out = vulnerabilityTable(all, all, accepted);
  assert.match(out, /`a` .*no fix \| accepted \(#7\)/);
  assert.match(out, /`b` .*b 2\.0\.0 \(a major\) \| \*\*NOT ACCEPTED\*\*/);
});

test('the latest table counts each direct dependency once', () => {
  const pkg = { dependencies: { a: '^1.0.0' }, devDependencies: { b: '^1.0.0' } };
  const lock = { packages: { 'node_modules/a': { version: '1.0.0' }, 'node_modules/b': { version: '1.1.0' } } };
  const registry = {
    a: { time: { '1.0.0': '2026-01-01T00:00:00Z', '2.0.0': '2026-10-01T00:00:00Z' }, latest: '2.0.0' },
    b: { time: { '1.1.0': '2026-01-01T00:00:00Z' }, latest: '1.1.0' },
  };
  const out = latestTable(pkg, lock, registry, now);
  assert.match(out, /\| At the target \| 1 \|/);
  assert.match(out, /\| A major behind \| 1 \| `a` 1\.0\.0 → 2\.0\.0 \|/);
});
