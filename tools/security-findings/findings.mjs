/**
 * Turns `npm audit` and Trivy output into one list of findings, and decides which are new.
 *
 * The deciding is here, in a pure function over plain data, rather than inline in the workflow. A
 * comparison written in YAML can only be tested by pushing a branch and waiting for a schedule, so
 * in practice it is never tested at all - and the failure mode is silent: a gate that lets
 * everything through looks exactly like a gate with nothing to catch. `findings.test.mjs` plants a
 * finding that is not accepted and one that is, and requires the first to be reported and the
 * second not. See #2118.
 */

/** Severities this repository acts on. Anything else is counted and ignored. */
export const ACTED_ON = ['CRITICAL', 'HIGH'];

/**
 * One finding, however it was discovered.
 *
 * `id` is the advisory's own identifier - a CVE for Trivy, npm's numeric advisory id for `npm
 * audit` - and `package` the thing it is in. Both are needed to match: the same CVE appears against
 * several packages in one image (OpenSSL's CVEs land on `libcrypto3` and `libssl3` alike), and
 * accepting it for one must not silently accept it for the other.
 */
const finding = (id, pkg, severity, source, title = '') => ({
  id: String(id),
  package: String(pkg),
  severity: String(severity).toUpperCase(),
  source,
  title
});

/** The key an accepted entry is matched on. Case-insensitive: Trivy and npm disagree on case. */
export const keyOf = (f) => `${String(f.id).toLowerCase()}::${String(f.package).toLowerCase()}`;

/**
 * Findings from `npm audit --json` (v2 report format).
 *
 * npm reports one entry per package with a `via` list that mixes advisory objects and the names of
 * packages that pull them in. Only the objects carry an id, so a package whose `via` is entirely
 * strings is vulnerable only through a dependency, and its advisories are reported against that
 * dependency instead. Those still produce a finding, with the id `transitive`, because a package
 * with a high severity and no advisory of its own is exactly the case that would otherwise vanish.
 */
export function fromNpmAudit(report) {
  const out = [];
  const vulnerabilities = (report && report.vulnerabilities) || {};

  for (const [name, info] of Object.entries(vulnerabilities)) {
    const severity = String(info.severity || '').toUpperCase();

    if (!ACTED_ON.includes(severity)) {
      continue;
    }

    const advisories = (info.via || []).filter((v) => v && typeof v === 'object');

    if (advisories.length === 0) {
      out.push(finding('transitive', name, severity, 'npm', `via ${(info.via || []).join(', ')}`));
      continue;
    }

    for (const advisory of advisories) {
      out.push(finding(advisory.source ?? advisory.url ?? 'unknown', name, severity, 'npm', advisory.title || ''));
    }
  }

  return out;
}

/**
 * Findings from `trivy image --format json`.
 *
 * `Class` separates OS packages from language ones; `os-pkgs` is apk or dpkg. The distinction is
 * kept on the finding because the two are fixed in completely different ways - a base image change
 * against a dependency change - and because the npm half is already covered by `npm audit`, so a
 * report that merges them double-counts.
 */
export function fromTrivy(report, image = '') {
  const out = [];

  for (const result of (report && report.Results) || []) {
    const isOs = result.Class === 'os-pkgs';

    for (const v of result.Vulnerabilities || []) {
      const severity = String(v.Severity || '').toUpperCase();

      if (!ACTED_ON.includes(severity)) {
        continue;
      }

      out.push(
        finding(
          v.VulnerabilityID,
          v.PkgName,
          severity,
          isOs ? `trivy-os:${image}` : `trivy-lang:${image}`,
          v.Title || ''
        )
      );
    }
  }

  return out;
}

/**
 * Reads `.github/security/accepted-advisories.json`.
 *
 * Every entry must carry an `issue`. An acceptance with no issue behind it is how a finding becomes
 * permanent: nobody is tracking it, nothing will ever remove the entry, and the file slowly turns
 * into a list of things this repository has given up on. Rejected loudly rather than skipped,
 * because a malformed entry that is quietly ignored would silently start failing the build.
 */
export function readAccepted(json) {
  const entries = Array.isArray(json) ? json : (json && json.accepted) || [];
  const problems = [];
  const accepted = new Map();

  entries.forEach((entry, i) => {
    for (const field of ['id', 'package', 'reason', 'issue']) {
      if (!entry || entry[field] === undefined || entry[field] === null || `${entry[field]}`.trim() === '') {
        problems.push(`entry ${i}: missing ${field}`);
      }
    }

    if (entry && entry.id && entry.package) {
      accepted.set(keyOf(entry), entry);
    }
  });

  return { accepted, problems };
}

/**
 * Splits findings into the ones to report and the ones already accepted.
 *
 * Also returns `staleAcceptances`: entries in the file that nothing found any more. They are not an
 * error - an image is scanned on some runs and not others - but they are what lets the file be
 * cleaned up instead of growing for ever.
 */
export function compare(findings, acceptedMap) {
  const reported = [];
  const accepted = [];
  const matched = new Set();

  for (const f of findings) {
    const key = keyOf(f);

    if (acceptedMap.has(key)) {
      matched.add(key);
      accepted.push({ ...f, acceptance: acceptedMap.get(key) });
    } else {
      reported.push(f);
    }
  }

  const staleAcceptances = [...acceptedMap.values()].filter((e) => !matched.has(keyOf(e)));

  return { reported, accepted, staleAcceptances };
}

/** The lines a run prints, and an issue body is built from. Deterministic: sorted, deduplicated. */
export function summarise(reported) {
  const seen = new Map();

  for (const f of reported) {
    const key = `${keyOf(f)}::${f.source}`;

    if (!seen.has(key)) {
      seen.set(key, f);
    }
  }

  return [...seen.values()]
    .sort(
      (a, b) =>
        ACTED_ON.indexOf(a.severity) - ACTED_ON.indexOf(b.severity) ||
        a.package.localeCompare(b.package) ||
        a.id.localeCompare(b.id)
    )
    .map((f) => `${f.severity}  ${f.package}  ${f.id}  (${f.source})${f.title ? ` - ${f.title}` : ''}`);
}
