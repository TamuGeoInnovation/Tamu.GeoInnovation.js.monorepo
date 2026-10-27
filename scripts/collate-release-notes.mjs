/**
 * Gather `docs/releases/unreleased/*.md` into one release's notes.
 *
 * Entries used to go into the top of `docs/releases/unreleased.md`, and their *What to test on dev*
 * row into the top of its table. Two pull requests adding at the same line conflict every time: on
 * 20 October 2026 six in one day each had to be resolved by hand, always in the same two places and
 * always "keep both". One file per change removes that by construction — a new file cannot conflict
 * with another new file.
 *
 *   node scripts/collate-release-notes.mjs --check     validate every entry, change nothing
 *   node scripts/collate-release-notes.mjs             print the collated Markdown
 *   node scripts/collate-release-notes.mjs --write     write it into docs/releases/unreleased.md
 *
 * `--check` is the one to run in CI and before a release: it fails on a malformed entry, a file name
 * that disagrees with its `issue`, or an image path that does not resolve. A broken image in the
 * release notes is found by a reader, usually after the release has gone out (#1132).
 *
 * It does not delete the entries. The release pull request does that, with everything else it does.
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const RELEASES = path.join(HERE, '..', 'docs', 'releases');
const SMOKE = path.join(HERE, '..', 'test', 'smoke', 'aggiemap');
const ENTRIES = path.join(RELEASES, 'unreleased');

const args = new Set(process.argv.slice(2));
const check = args.has('--check');
const write = args.has('--write');

/** `---\n...\n---\n` at the top of the file. Deliberately simple: three keys, no nesting. */
function parseEntry(file, source) {
  const problems = [];
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    return { file, problems: ['no front matter: the file must start with a --- block'] };
  }

  const [, head, body] = match;
  const issue = head.match(/^issue:\s*(\d+)\s*$/m);
  const title = head.match(/^title:\s*(.+?)\s*$/m);
  const testOnDev = head.match(/^testOnDev:\s*\|\r?\n([\s\S]*?)(?=\r?\n[a-zA-Z]+:|$)/m);

  if (!issue) problems.push('no `issue:` in the front matter');
  if (!title) problems.push('no `title:` in the front matter');

  const expected = issue ? new RegExp(`^${issue[1]}-`) : null;
  if (issue && !expected.test(file)) {
    problems.push(`file name does not start with ${issue[1]}-, which its issue says it should`);
  }

  if (!body.trim()) problems.push('the entry body is empty');
  if (body.trim() && !/^###\s/m.test(body)) {
    problems.push('the body has no ### heading, which is what a reader sees in the notes');
  }

  // Image paths are written relative to docs/releases/, because that is where the collated file lands.
  for (const [, src] of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    if (/^https?:/.test(src)) continue;
    if (!fs.existsSync(path.resolve(RELEASES, src))) {
      problems.push(`image not found, resolved from docs/releases/: ${src}`);
    }
  }

  // An AggieMap host an entry names has to be one the smoke suite actually uses, because the *What to
  // test on dev* rows are links the team follows before a release, and a wrong host is only discovered
  // by the person following it. `aggiemap-dev.tamu.edu` does not resolve - development is
  // `dev.aggiemap.tamu.edu` - and four entries shipped with the wrong one (#2451).
  //
  // Only AggieMap's own hosts are checked. The repository's notes also name gisday.tamu.edu and
  // others that this suite knows nothing about, and a check that fails on those would be turned off.
  const known = new Set(
    Object.values(JSON.parse(fs.readFileSync(path.join(SMOKE, 'environments.json'), 'utf8')))
      .map((environment) => environment?.baseUrl)
      .filter(Boolean)
      .map((url) => new URL(url).hostname.toLowerCase())
  );

  for (const [, host] of (head + body).matchAll(/https?:\/\/([a-z0-9.-]*aggiemap[a-z0-9.-]*)/gi)) {
    const hostname = host.toLowerCase();

    if (!known.has(hostname)) {
      problems.push(
        `unknown AggieMap host ${hostname}: the suite uses ${[...known].sort().join(', ')}. A link the team cannot follow is worse than no link`
      );
    }
  }

  return {
    file,
    issue: issue ? Number(issue[1]) : null,
    title: title ? title[1] : null,
    body: body.trim(),
    testOnDev: testOnDev ? testOnDev[1].replace(/^[ \t]{2}/gm, '').trim() : null,
    problems
  };
}

if (!fs.existsSync(ENTRIES)) {
  console.error(`No ${path.relative(path.join(HERE, '..'), ENTRIES)} directory.`);
  process.exit(1);
}

const files = fs.readdirSync(ENTRIES).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
const entries = files.map((f) => parseEntry(f, fs.readFileSync(path.join(ENTRIES, f), 'utf8')));
const broken = entries.filter((e) => e.problems.length);

if (broken.length) {
  console.error('These entries cannot be collated:\n');
  for (const e of broken) {
    console.error(`  ${e.file}`);
    for (const p of e.problems) console.error(`    - ${p}`);
  }
  console.error('\nSee docs/releases/unreleased/README.md for the format.');
  process.exit(1);
}

if (check) {
  const withRow = entries.filter((e) => e.testOnDev).length;
  console.log(`${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} read, ${withRow} with a What to test on dev row, no problems.`);
  if (entries.length === 0) console.log('(Nothing to collate yet.)');
  process.exit(0);
}

const ordered = [...entries].sort((a, b) => a.issue - b.issue);
const rows = ordered.filter((e) => e.testOnDev);

const summary = ordered.map((e) => e.body + '\n').join('\n');
const table = rows.map((e) => e.testOnDev).join('\n');

if (!write) {
  console.log(['## Summary', '', summary, ...(rows.length ? ['---', '', '## What to test on dev', '', '| Change | Open this on dev | Look for |', '| --- | --- | --- |', table, ''] : [])].join('\n'));
  process.exit(0);
}

/**
 * `--write` merges into the two sections `unreleased.md` already has, rather than pasting a second
 * copy of them into the middle of it.
 *
 * Entries written before this directory existed are **not** migrated — rewriting 55 of them is churn
 * for no benefit — so both have to survive a release, and the collated entries go above them in the
 * same `## Summary`, with the collated rows going into the existing table under its header.
 */
const target = path.join(RELEASES, 'unreleased.md');
let text = fs.readFileSync(target, 'utf8');

const SUMMARY = /^## Summary[ \t]*\r?\n/m;
if (!SUMMARY.test(text)) {
  console.error('unreleased.md has no "## Summary" heading to collate into.');
  process.exit(1);
}
text = text.replace(SUMMARY, (heading) => heading + '\n' + summary);

if (rows.length) {
  const HEADER = /(^## What to test on dev[\s\S]*?^\| --- \| --- \| --- \|[ \t]*\r?\n)/m;
  if (!HEADER.test(text)) {
    console.error('unreleased.md has no "What to test on dev" table header to add rows under.');
    console.error('The entries were not written. Add the table, or collate by hand this once.');
    process.exit(1);
  }
  text = text.replace(HEADER, (header) => header + table + '\n');
}

fs.writeFileSync(target, text, 'utf8');
console.log(`Collated ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} into docs/releases/unreleased.md:`);
console.log(`  ${ordered.length} added to ## Summary, ${rows.length} row(s) added to What to test on dev.`);
console.log('The entry files are left in place; the release pull request removes them.');
