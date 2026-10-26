#!/usr/bin/env node
// Prints "the tables": vulnerabilities, how far each dependency is from the latest it may take (#1218), and what knip
// finds unused (#2122). The maintainer asks for all three together, and they used to be rebuilt by hand each time, from
// commands nobody had written down. scripts/security-tables.sh gathers the inputs on a commit and runs this; the README
// says how to read the result.
//
//   node tools/security-findings/tables.mjs --audit-all a.json --audit-prod p.json --accepted accepted-advisories.json \
//     --package package.json --lock package-lock.json --knip knip.json [--registry registry.json] [--now <ISO date>]
//
// --registry is a JSON object of package name -> {time, latest}: the registry's `time` object and its `latest` dist-tag.
// Without it, this fetches each direct dependency's document from registry.npmjs.org, so it needs the network.
// The pure functions below are exported for tables.test.mjs, which runs without the network.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fromNpmAudit, readAccepted, compare } from './findings.mjs';

export const COOLDOWN_DAYS = 7; // CLAUDE.md: the latest release at least 7 days old (#2333)
const SEVERITIES = ['critical', 'high', 'moderate', 'low'];

/** "1.2.3" or "1.2.3-rc.1" -> {major, minor, patch, pre}; null for anything else. */
export function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(String(v || '').trim());
  return m ? { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] || '' } : null;
}

export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  for (const k of ['major', 'minor', 'patch']) {
    if (x[k] !== y[k]) return x[k] - y[k];
  }
  if (x.pre === y.pre) return 0;
  return x.pre === '' ? 1 : y.pre === '' ? -1 : x.pre < y.pre ? -1 : 1;
}

/**
 * From a registry `time` object, the highest stable version published at least `days` before `now`, and the highest
 * stable version at all. A prerelease is never a target. Backports (a 3.x published after 4.x) sort by version, not date.
 */
export function targets(time, now, days = COOLDOWN_DAYS, latest = null) {
  const cutoff = now.getTime() - days * 86400000;
  let eligible = null;
  let newest = null;
  for (const [v, when] of Object.entries(time || {})) {
    const p = parseVersion(v);
    if (!p || p.pre) continue;
    // Never above the registry's `latest` tag: a package can publish a placeholder far above it (nx has a 9999.0.1).
    if (latest && compareVersions(v, latest) > 0) continue;
    if (!newest || compareVersions(v, newest) > 0) newest = v;
    if (Date.parse(when) <= cutoff && (!eligible || compareVersions(v, eligible) > 0)) eligible = v;
  }
  return { eligible, newest };
}

/** How far `installed` is behind `target`: current, patch, minor or major. */
export function behind(installed, target) {
  const a = parseVersion(installed);
  const b = parseVersion(target);
  if (!a || !b || compareVersions(installed, target) >= 0) return 'current';
  if (a.major !== b.major) return 'major';
  if (a.minor !== b.minor) return 'minor';
  return 'patch';
}

/** npm audit's own counts by severity. */
export function auditCounts(report) {
  const v = (report && report.metadata && report.metadata.vulnerabilities) || {};
  return Object.fromEntries(SEVERITIES.map((s) => [s, v[s] || 0]));
}

/** The project a file belongs to: the longest project root that contains it, or "(workspace)". */
export function projectOf(file, roots) {
  let best = '';
  for (const r of roots) {
    if ((file === r || file.startsWith(r + '/')) && r.length > best.length) best = r;
  }
  return best || '(workspace)';
}

/** knip's JSON reporter: unused files and unused dependencies, whichever shape the version writes. */
export function fromKnip(report) {
  const issues = (report && report.issues) || [];
  const files = new Set(Array.isArray(report && report.files) ? report.files : []);
  const deps = [];
  for (const i of issues) {
    if (Array.isArray(i.files) && i.files.length) files.add(i.file);
    for (const kind of ['dependencies', 'devDependencies']) {
      for (const d of i[kind] || []) deps.push({ name: typeof d === 'string' ? d : d.name, kind, file: i.file });
    }
  }
  return { files: [...files].sort(), deps };
}

const cell = (s) => String(s).replace(/\|/g, '\\|');

export function vulnerabilityTable(all, prod, acceptedJson) {
  const out = ['## 1. Vulnerabilities', ''];
  const a = auditCounts(all);
  const p = auditCounts(prod);
  out.push('| | Critical | High | Moderate | Low |', '| --- | --- | --- | --- | --- |');
  out.push(`| Everything (\`npm audit\`) | ${a.critical} | ${a.high} | ${a.moderate} | ${a.low} |`);
  out.push(`| Production only (\`--omit=dev\`) | ${p.critical} | ${p.high} | ${p.moderate} | ${p.low} |`, '');

  const { accepted } = readAccepted(acceptedJson);
  const prodNames = new Set(Object.keys((prod && prod.vulnerabilities) || {}));
  const acted = compare(fromNpmAudit(all), accepted);
  const issueOf = new Map(acted.accepted.map((f) => [f.package, f.acceptance.issue]));
  const rows = Object.entries((all && all.vulnerabilities) || {})
    .map(([name, info]) => {
      const own = (info.via || []).filter((v) => v && typeof v === 'object');
      const what = own.length ? own.map((v) => v.title).join('; ') : `through ${(info.via || []).join(', ')}`;
      const f = info.fixAvailable;
      const fix = f === false ? 'no fix' : f === true ? 'fix in range' : f && f.name ? `${f.name} ${f.version}${f.isSemVerMajor ? ' (a major)' : ''}` : '';
      const sev = String(info.severity);
      const status = issueOf.has(name)
        ? `accepted (${issueOf.get(name).replace(/.*\/issues\//, '#')})`
        : ['critical', 'high'].includes(sev) ? '**NOT ACCEPTED**' : 'not acted on (below High)';
      return { sev, row: `| ${sev} | \`${name}\` | ${prodNames.has(name) ? 'production' : 'dev only'} | ${cell(what)} | ${fix} | ${status} |` };
    })
    .sort((x, y) => SEVERITIES.indexOf(x.sev) - SEVERITIES.indexOf(y.sev));
  if (rows.length) {
    out.push('| Severity | Package | Where | Problem | Fix | Status |', '| --- | --- | --- | --- | --- | --- |');
    out.push(...rows.map((r) => r.row));
  } else {
    out.push('Nothing found.');
  }
  return out.join('\n');
}

export function latestTable(pkg, lock, registry, now, holds = []) {
  const out = ['## 2. Latest (#1218)', '', `Target: the newest stable release at least ${COOLDOWN_DAYS} days old (CLAUDE.md, #2333).`, ''];
  const direct = { ...(pkg.devDependencies || {}), ...(pkg.dependencies || {}) };
  const groups = { current: [], patch: [], minor: [], major: [] };
  const waiting = [];
  const unknown = [];
  for (const name of Object.keys(direct).sort()) {
    const installed = lock.packages && lock.packages[`node_modules/${name}`] && lock.packages[`node_modules/${name}`].version;
    const doc = registry[name];
    const t = doc ? (doc.time ? targets(doc.time, now, COOLDOWN_DAYS, doc.latest) : targets(doc, now)) : null;
    if (!installed || !t || !t.eligible) {
      unknown.push(name);
      continue;
    }
    const k = behind(installed, t.eligible);
    groups[k].push({ name, installed, target: t.eligible });
    if (t.newest && compareVersions(t.newest, t.eligible) > 0 && compareVersions(t.newest, installed) > 0) {
      waiting.push(`\`${name}\` ${t.newest}`);
    }
  }
  const list = (g) => g.map((d) => `\`${d.name}\` ${d.installed} → ${d.target}`).join(', ') || '-';
  out.push('| | Direct dependencies | Which |', '| --- | --- | --- |');
  out.push(`| At the target | ${groups.current.length} | |`);
  out.push(`| A patch behind | ${groups.patch.length} | ${list(groups.patch)} |`);
  out.push(`| A minor behind | ${groups.minor.length} | ${list(groups.minor)} |`);
  out.push(`| A major behind | ${groups.major.length} | ${list(groups.major)} |`);
  out.push(`| Newer, but under ${COOLDOWN_DAYS} days old | ${waiting.length} | ${waiting.join(', ') || '-'} |`);
  if (unknown.length) out.push(`| Not compared (no stable release found) | ${unknown.length} | ${unknown.map((n) => `\`${n}\``).join(', ')} |`);
  if (holds.length) out.push('', `Held on purpose in \`.github/dependabot.yml\`: ${holds.map((h) => `\`${h}\``).join(', ')}.`);
  return out.join('\n');
}

export function unusedTable(knip, roots, excluded = []) {
  const out = ['## 3. Unused components (#2122, #1457, #1899)', ''];
  const { files, deps } = fromKnip(knip);
  const byProject = new Map();
  for (const f of files) {
    const p = projectOf(f, roots);
    byProject.set(p, [...(byProject.get(p) || []), f]);
  }
  out.push('| Area | Count | Which |', '| --- | --- | --- |');
  out.push(`| Unused dependencies (knip) | ${deps.length} | ${deps.map((d) => `\`${d.name}\``).join(', ') || '-'} |`);
  out.push(`| Unused files (knip) | ${files.length} | in ${byProject.size} project(s), below |`);
  out.push(`| Projects CI does not build (\`build.yml\`) | ${excluded.length} | ${excluded.map((e) => `\`${e}\``).join(', ') || '-'} |`, '');
  if (byProject.size) {
    out.push('| Project | Unused files |', '| --- | --- |');
    for (const [p, fs] of [...byProject].sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0]))) {
      out.push(`| \`${p}\` | ${fs.length} |`);
    }
  }
  return out.join('\n');
}

async function fetchTimes(names) {
  const out = {};
  let i = 0;
  async function worker() {
    while (i < names.length) {
      const name = names[i++];
      const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`);
      if (res.ok) {
        const doc = await res.json();
        out[name] = { time: doc.time || {}, latest: (doc['dist-tags'] || {}).latest || null };
      }
    }
  }
  await Promise.all(Array.from({ length: 12 }, worker));
  return out;
}

async function main(argv) {
  const arg = (k) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const json = (k) => JSON.parse(readFileSync(arg(k), 'utf8'));
  const now = arg('--now') ? new Date(arg('--now')) : new Date();
  const pkg = json('--package');
  const lock = json('--lock');
  const names = Object.keys({ ...(pkg.devDependencies || {}), ...(pkg.dependencies || {}) });
  const registry = arg('--registry') ? json('--registry') : await fetchTimes(names);
  const roots = arg('--roots') ? readFileSync(arg('--roots'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : [];
  const excluded = (arg('--excluded') || '').split(',').filter(Boolean);
  const holds = (arg('--holds') || '').split(',').filter(Boolean);
  console.log(
    [
      vulnerabilityTable(json('--audit-all'), json('--audit-prod'), json('--accepted')),
      latestTable(pkg, lock, registry, now, holds),
      unusedTable(json('--knip'), roots, excluded),
    ].join('\n\n'),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(`tables: ${e.message}`);
    process.exit(2);
  });
}
