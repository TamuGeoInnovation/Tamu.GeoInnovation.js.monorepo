/**
 * The test the daily scan exists for: a finding that is not accepted must be reported, and one that
 * is must not (#2118).
 *
 * Run by `tools-tests.yml` with `node --test 'tools/**\/*.test.mjs'`. No network, no npm, no Docker:
 * the inputs are small fixtures in the shape `npm audit --json` and `trivy --format json` really
 * produce, so the comparison can be tested without waiting for a schedule to fire.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { compare, fromNpmAudit, fromTrivy, keyOf, readAccepted, summarise } from './findings.mjs';

/** Shaped as npm audit v2 reports it, with one advisory object and one string in `via`. */
const NPM_REPORT = {
  auditReportVersion: 2,
  vulnerabilities: {
    'class-validator': {
      severity: 'critical',
      via: [{ source: 1088816, title: 'SQL Injection and Cross-site Scripting in class-validator' }]
    },
    nodemailer: {
      severity: 'high',
      via: [{ source: 1109804, title: 'Email to an unintended domain' }]
    },
    'some-moderate-thing': { severity: 'moderate', via: [{ source: 999, title: 'ignored' }] },
    'pulled-in-by-another': { severity: 'high', via: ['class-validator'] }
  }
};

/** Shaped as Trivy reports it: OS packages and language packages in separate results. */
const TRIVY_REPORT = {
  Results: [
    {
      Class: 'os-pkgs',
      Type: 'alpine',
      Vulnerabilities: [
        { VulnerabilityID: 'CVE-2023-38545', PkgName: 'curl', Severity: 'CRITICAL', Title: 'SOCKS5 heap overflow' },
        { VulnerabilityID: 'CVE-2023-38545', PkgName: 'libcurl', Severity: 'CRITICAL', Title: 'SOCKS5 heap overflow' },
        { VulnerabilityID: 'CVE-2000-0000', PkgName: 'quiet', Severity: 'MEDIUM', Title: 'ignored' }
      ]
    },
    {
      Class: 'lang-pkgs',
      Type: 'node-pkg',
      Vulnerabilities: [{ VulnerabilityID: 'CVE-2026-9', PkgName: 'left-pad', Severity: 'HIGH', Title: 'in the image' }]
    }
  ]
};

test('only critical and high are acted on', () => {
  const npm = fromNpmAudit(NPM_REPORT);
  const trivy = fromTrivy(TRIVY_REPORT, 'an-image');

  assert.ok(!npm.some((f) => f.package === 'some-moderate-thing'), 'a moderate npm advisory was reported');
  assert.ok(!trivy.some((f) => f.package === 'quiet'), 'a medium Trivy finding was reported');
});

test('a package vulnerable only through a dependency is still a finding', () => {
  // `via` holds no advisory object, so there is no id to report. Dropping it would lose a high
  // severity entirely, which is the one thing this must not do.
  const f = fromNpmAudit(NPM_REPORT).find((x) => x.package === 'pulled-in-by-another');

  assert.ok(f, 'a high severity with no advisory object of its own was dropped');
  assert.equal(f.id, 'transitive');
});

test('Trivy OS and language findings are kept apart', () => {
  const trivy = fromTrivy(TRIVY_REPORT, 'an-image');

  assert.equal(trivy.find((f) => f.package === 'curl').source, 'trivy-os:an-image');
  assert.equal(trivy.find((f) => f.package === 'left-pad').source, 'trivy-lang:an-image');
});

test('an accepted finding is not reported, and an unaccepted one is', () => {
  const findings = [...fromNpmAudit(NPM_REPORT), ...fromTrivy(TRIVY_REPORT, 'an-image')];

  const { accepted } = readAccepted([
    {
      id: '1088816',
      package: 'class-validator',
      reason: 'upgrade to 0.15 is in flight',
      issue: 'https://example.invalid/2113'
    },
    { id: 'CVE-2023-38545', package: 'curl', reason: 'the base image is being rebuilt', issue: 'x/2119' }
  ]);

  const { reported } = compare(findings, accepted);
  const keys = reported.map(keyOf);

  assert.ok(!keys.includes('1088816::class-validator'), 'an accepted npm advisory was reported');
  assert.ok(!keys.includes('cve-2023-38545::curl'), 'an accepted OS finding was reported');

  // The planted one: same CVE, different package. Accepting it for curl must not accept it for
  // libcurl - one entry silently covering a package nobody listed is how a gate stops gating.
  assert.ok(keys.includes('cve-2023-38545::libcurl'), 'the same CVE on another package was treated as accepted');
  assert.ok(keys.includes('1109804::nodemailer'), 'an unaccepted advisory was not reported');
});

test('matching ignores case, because Trivy and npm disagree on it', () => {
  const { accepted } = readAccepted([
    { id: 'cve-2023-38545', package: 'CURL', reason: 'r', issue: 'i' }
  ]);
  const { reported } = compare(fromTrivy(TRIVY_REPORT, 'an-image'), accepted);

  assert.ok(!reported.map(keyOf).includes('cve-2023-38545::curl'), 'case alone defeated an acceptance');
});

test('an acceptance with no issue behind it is a problem, not a silent pass', () => {
  const { problems } = readAccepted([{ id: 'x', package: 'y', reason: 'because' }]);

  assert.equal(problems.length, 1);
  assert.match(problems[0], /missing issue/);
});

test('acceptances nothing finds any more are listed, so the file can be cleaned up', () => {
  const { accepted } = readAccepted([
    { id: '1109804', package: 'nodemailer', reason: 'r', issue: 'i' },
    { id: 'CVE-1999-0001', package: 'gone', reason: 'fixed months ago', issue: 'i' }
  ]);

  const { staleAcceptances } = compare(fromNpmAudit(NPM_REPORT), accepted);

  assert.deepEqual(staleAcceptances.map((e) => e.package), ['gone']);
});

test('the summary is deterministic and deduplicated', () => {
  const twice = [...fromTrivy(TRIVY_REPORT, 'an-image'), ...fromTrivy(TRIVY_REPORT, 'an-image')];
  const lines = summarise(twice);

  assert.deepEqual(lines, summarise([...twice].reverse()), 'the order depended on the input order');
  assert.equal(new Set(lines).size, lines.length, 'the same finding was listed twice');
});
