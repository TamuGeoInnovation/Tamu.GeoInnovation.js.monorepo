/**
 * Gather `docs/releases/unreleased/*.md` into one release's notes.
 *
 * Entries used to go into the top of `docs/releases/unreleased.md`, and their *What to test on dev*
 * row into the top of its table. Two pull requests adding at the same line conflict every time: on
 * 20 October 2026 six in one day each had to be resolved by hand, always in the same two places and
 * always "keep both". One file per change removes that by construction - a new file cannot conflict
 * with another new file.
 *
 *   node scripts/collate-release-notes.mjs --check     validate every entry, change nothing
 *   node scripts/collate-release-notes.mjs             print the collated Markdown
 *   node scripts/collate-release-notes.mjs --write     write each entry into its application's notes
 *
 * `--check` is the one to run in CI and before a release: it fails on a malformed entry, a file name
 * that disagrees with its `issue`, or an image path that does not resolve. A broken image in the
 * release notes is found by a reader, usually after the release has gone out (#1132).
 *
 * Each application is released on its own path, so each has its own notes: an entry's `app:` names
 * it, AggieMap's when absent, and `--write` collates it into `unreleased.md` for AggieMap and
 * `<app>-unreleased.md` for any other. On 10 November 2026 there was no `app:`, and 23 GIS Day
 * entries were collated into an AggieMap release's notes as though it had shipped them (#2835).
 *
 * Tested by scripts/collate-release-notes.test.sh.
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

/** The application an entry belongs to when it does not say. */
const DEFAULT_APP = 'aggiemap';

/** Where an application's entries are collated: AggieMap's file came first, so it has no prefix. */
function notesFile(app) {
  return path.join(RELEASES, app === DEFAULT_APP ? 'unreleased.md' : `${app}-unreleased.md`);
}

/**
 * GIS Day's own sites. An entry that links one and does not declare an application is almost
 * certainly GIS Day's, written by an author who did not know about `app:` - which was every author
 * until #2835. Routing only helps the ones who remember, so this is the check that matters.
 *
 * The title is not used: "GIS Day notice" (#2678) is an AggieMap change. Nor is the issue's project,
 * which needs GitHub, and this script runs offline.
 */
const GISDAY_HOSTS = ['txgisday.org', 'gisday.tamu.edu', 'gisday.ucgis.org'];

/** `---\n...\n---\n` at the top of the file. Deliberately simple: four keys, no nesting. */
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
  const declared = head.match(/^app:\s*(.*?)\s*$/m);
  const app = declared ? declared[1].toLowerCase() : DEFAULT_APP;

  if (!issue) problems.push('no `issue:` in the front matter');
  if (!title) problems.push('no `title:` in the front matter');

  if (declared && !/^[a-z0-9-]+$/.test(app)) {
    problems.push(`\`app: ${declared[1]}\` is not an application name, such as aggiemap or gisday`);
  } else if (!fs.existsSync(notesFile(app))) {
    problems.push(
      `\`app: ${app}\` has no notes file: docs/releases/${path.basename(notesFile(app))} does not exist. Check the spelling, or create the file for a new application`
    );
  }

  if (!declared) {
    const gisday = GISDAY_HOSTS.filter((host) =>
      new RegExp(`https?://(?:www\\.)?${host.replace(/\./g, '\\.')}`, 'i').test(head + body)
    );
    if (gisday.length) {
      problems.push(
        `links ${gisday.join(', ')}, so it looks like GIS Day's, but does not say so. Add \`app: gisday\` to the front matter, or \`app: aggiemap\` if it really is AggieMap's: GIS Day is released separately, and an undeclared entry goes into AggieMap's notes`
      );
    }
  }

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
    app,
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
const apps = [...new Set(ordered.map((e) => e.app))].sort((a, b) =>
  a === DEFAULT_APP ? -1 : b === DEFAULT_APP ? 1 : a.localeCompare(b)
);

const TABLE_HEADER = '| Change | Open this on dev | Look for |\n| --- | --- | --- |\n';

function collated(app) {
  const mine = ordered.filter((e) => e.app === app);
  const rows = mine.filter((e) => e.testOnDev);
  return { mine, rows, summary: mine.map((e) => e.body + '\n').join('\n'), table: rows.map((e) => e.testOnDev).join('\n') };
}

if (!write) {
  for (const app of apps) {
    const { rows, summary, table } = collated(app);
    if (apps.length > 1) console.log(`<!-- docs/releases/${path.basename(notesFile(app))} -->\n`);
    console.log(
      [
        '## Summary',
        '',
        summary,
        ...(rows.length ? ['---', '', '## What to test on dev', '', TABLE_HEADER + table, ''] : [])
      ].join('\n')
    );
  }
  process.exit(0);
}

/**
 * `--write` merges into the two sections each notes file already has, rather than pasting a second
 * copy of them into the middle of it.
 *
 * Entries written before this directory existed are **not** migrated - rewriting 55 of them is churn
 * for no benefit - so both have to survive a release, and the collated entries go above them in the
 * same `## Summary`, with the collated rows going into the existing table under its header.
 *
 * The rows go into the table inside their own section: AggieMap's is "What to test on dev", GIS Day's
 * "What to check, and where", since it has no dev site. A release leaves that section with no table,
 * and the next table in the file used to be taken instead, which put the rows into "Work in flight"'s
 * list of open pull requests (#2835). A section with no table now gets one.
 *
 * Every file is worked out before any is written, so a collation that cannot finish writes nothing.
 */
const SUMMARY = /^## Summary[ \t]*\r?\n/m;
const SECTION = /^## What to (?:test on dev|check, and where)[ \t]*\r?\n/m;
const HEADER = /^\| Change \| Open this on dev \| Look for \|[ \t]*\r?\n\| --- \| --- \| --- \|[ \t]*\r?\n/m;

const results = [];
for (const app of apps) {
  const target = notesFile(app);
  const name = path.basename(target);
  const { mine, rows, summary, table } = collated(app);
  let text = fs.readFileSync(target, 'utf8');

  if (!SUMMARY.test(text)) {
    console.error(`${name} has no "## Summary" heading to collate into. Nothing was written.`);
    process.exit(1);
  }
  text = text.replace(SUMMARY, (heading) => heading + '\n' + summary);

  if (rows.length) {
    const heading = text.match(SECTION);
    if (!heading) {
      console.error(`${name} has no "## What to test on dev" section to add rows to. Nothing was written.`);
      process.exit(1);
    }
    const start = heading.index + heading[0].length;
    const next = text.slice(start).search(/^## /m);
    const end = next === -1 ? text.length : start + next;
    let section = text.slice(start, end);

    if (HEADER.test(section)) {
      section = section.replace(HEADER, (header) => header + table + '\n');
    } else {
      // Above the section's closing rule and blank lines, so the table ends the section's prose.
      const [tail] = section.match(/(?:\s*^---[ \t]*)?\s*$/m);
      const prose = section.slice(0, section.length - tail.length);
      const closing = tail.includes('---') ? tail : '\n';
      section = `${prose}\n\n${TABLE_HEADER}${table}\n${closing}`;
    }
    text = text.slice(0, start) + section + text.slice(end);
  }

  results.push({ target, name, text, count: mine.length, rows: rows.length });
}

for (const r of results) fs.writeFileSync(r.target, r.text, 'utf8');
console.log(`Collated ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}:`);
for (const r of results) {
  console.log(`  docs/releases/${r.name}: ${r.count} added to ## Summary, ${r.rows} row(s) added to its table.`);
}
console.log('The entry files are left in place; the release pull request removes them.');
