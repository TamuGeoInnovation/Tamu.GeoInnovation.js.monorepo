#!/usr/bin/env node
/**
 * Reads the scan output a run produced, compares it with the accepted advisories, and says what is
 * new. Used by `.github/workflows/security-scan.yml` and by the publish gate (#2118).
 *
 *   node tools/security-findings/check.mjs --accepted .github/security/accepted-advisories.json \
 *     --npm audit.json --trivy image-a.json=ghcr.io/x/a:tag --trivy image-b.json=ghcr.io/x/b:tag \
 *     [--only-critical] [--summary out.md]
 *
 * Exit 0 when nothing new, 1 when something is, 2 when the inputs themselves are wrong - a
 * malformed accepted file, or a scan file that is not readable. The third case is deliberately not
 * folded into "nothing new": a gate that cannot read its own input must not report success.
 */

import fs from 'node:fs';
import path from 'node:path';

import { compare, fromNpmAudit, fromTrivy, readAccepted, summarise } from './findings.mjs';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);

  return i === -1 ? undefined : args[i + 1];
};
const all = (name) => args.map((a, i) => (a === name ? args[i + 1] : undefined)).filter(Boolean);

const acceptedPath = opt('--accepted');
const onlyCritical = args.includes('--only-critical');
const summaryPath = opt('--summary');

const die = (message) => {
  console.error(`security-findings: ${message}`);
  process.exit(2);
};

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    die(`could not read ${file}: ${error.message}`);
  }
};

if (!acceptedPath) {
  die('--accepted is required');
}

const { accepted, problems } = readAccepted(readJson(acceptedPath));

if (problems.length > 0) {
  die(`${acceptedPath} is not valid:\n  ${problems.join('\n  ')}`);
}

let findings = [];

for (const file of all('--npm')) {
  findings = findings.concat(fromNpmAudit(readJson(file)));
}

for (const spec of all('--trivy')) {
  // `<file>=<image>`, so the report can say which image a finding came from. An `=` in a path would
  // break this, which is why the image goes last and the split is on the first one.
  const at = spec.indexOf('=');
  const file = at === -1 ? spec : spec.slice(0, at);
  const image = at === -1 ? path.basename(spec, '.json') : spec.slice(at + 1);

  findings = findings.concat(fromTrivy(readJson(file), image));
}

if (findings.length === 0 && all('--npm').length === 0 && all('--trivy').length === 0) {
  die('no --npm or --trivy input was given, so nothing was checked');
}

const considered = onlyCritical ? findings.filter((f) => f.severity === 'CRITICAL') : findings;
const { reported, accepted: known, staleAcceptances } = compare(considered, accepted);
const lines = summarise(reported);

console.log(`scanned: ${considered.length} finding(s) at ${onlyCritical ? 'CRITICAL' : 'CRITICAL/HIGH'}`);
console.log(`accepted: ${known.length}, new: ${reported.length}`);

if (staleAcceptances.length > 0) {
  console.log(`\nacceptances nothing found this run (candidates to remove from ${path.basename(acceptedPath)}):`);
  for (const e of staleAcceptances) {
    console.log(`  ${e.id}  ${e.package}  ${e.issue}`);
  }
}

if (lines.length > 0) {
  console.log('\nnot accepted:');
  for (const line of lines) {
    console.log(`  ${line}`);
  }
}

if (summaryPath) {
  const body =
    lines.length === 0
      ? 'No findings outside `.github/security/accepted-advisories.json`.\n'
      : `${lines.length} finding(s) are not in \`.github/security/accepted-advisories.json\`:\n\n` +
        lines.map((l) => `- ${l}`).join('\n') +
        '\n\nEither fix them, or add an entry with the issue that tracks it.\n';

  fs.writeFileSync(summaryPath, body, 'utf8');
}

process.exit(lines.length > 0 ? 1 : 0);
