/**
 * Compares the layer titles the definitions hard-code with the names the services publish (#1508).
 *
 *   node tools/layer-titles/compare.mjs                 # report
 *   node tools/layer-titles/compare.mjs --markdown      # the table for the upstream issue
 *   node tools/layer-titles/compare.mjs --drop-identical # remove the titles that match
 *
 * A layer's name belongs to whoever publishes it, so a title here is an override. Most are not:
 * they restate the service's own name exactly, and deleting them changes nothing on screen because
 * Esri fills `title` from the service when the constructor is not given one.
 *
 * The rest differ, and they are not all improvements to drop blindly - one service layer named
 * "Event Parking" is used by the graduation maps for road closures, and three maps split a single
 * service layer into two filtered entries that only our titles tell apart. Those stay until the
 * service is renamed, which is what the markdown table is for.
 *
 * Re-run it as names are fixed upstream: it only ever reports what is still true today.
 */
import * as fs from 'fs';
import * as path from 'path';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DEFS = path.join(REPO, 'libs/ts/events/ngx/src/lib/definitions');

const markdown = process.argv.includes('--markdown');
const drop = process.argv.includes('--drop-identical');

const connections = fs.readFileSync(path.join(REPO, 'libs/aggiemap/ngx/common/src/lib/connections.ts'), 'utf8');

/** Production hosts and service URLs, read from the production branch of connections.ts. */
const hosts = {};
for (const m of connections.matchAll(/const (\w*[Hh]ost) = '([^']+)';/g)) hosts[m[1]] = m[2];

const urls = {};
for (const m of connections.matchAll(/(\w+Url):\s*`([^`]+)`/g)) {
  let value = m[2];
  for (const [k, v] of Object.entries(hosts)) value = value.split('${' + k + '}').join(v);
  if (!urls[m[1]] && !value.includes('${')) urls[m[1]] = value;
}

const files = fs.readdirSync(DEFS).filter((f) => f.endsWith('.definitions.ts'));
const targets = [];

for (const file of files) {
  const text = fs.readFileSync(path.join(DEFS, file), 'utf8');
  const roots = {};

  for (const m of text.matchAll(/const (\w+)\s*=\s*Connections\.(\w+);/g)) roots[m[1]] = urls[m[2]];

  const defsName = (text.match(/export const (\w*Definitions)\s*=/) || [])[1];

  for (const m of text.matchAll(/(\w+):\s*\{[^{}]*?name:\s*'([^']+)',\s*\n\s*url:\s*`\$\{(\w+)\}\/(\d+)`/g)) {
    const root = roots[m[3]];
    if (root) targets.push({ file, defsName, key: m[1], declared: m[2], url: root + '/' + m[4] });
  }
}

const seen = new Map();
const identical = [];
const differs = [];
const unanswered = [];

for (const t of targets) {
  if (!seen.has(t.url)) {
    try {
      const res = await fetch(t.url + '?f=json');
      const json = await res.json();
      seen.set(t.url, json.name || null);
    } catch {
      seen.set(t.url, null);
    }
  }

  const published = seen.get(t.url);
  t.published = published;

  if (published === null) unanswered.push(t);
  else if (published === t.declared) identical.push(t);
  else differs.push(t);
}

const mapName = (file) => file.replace('.definitions.ts', '');

if (markdown) {
  console.log('| Map | Layer | Name the map shows today | Name the service publishes |');
  console.log('| --- | --- | --- | --- |');
  differs
    .sort((a, b) => mapName(a.file).localeCompare(mapName(b.file)))
    .forEach((t) => console.log(`| \`${mapName(t.file)}\` | \`${t.key}\` | ${t.declared} | ${t.published} |`));
  process.exit(0);
}

console.log(`${targets.length} layer titles resolved to a production service`);
console.log(`  identical to the service: ${identical.length}`);
console.log(`  differ:                   ${differs.length}`);
console.log(`  service did not answer:   ${unanswered.length}\n`);

differs
  .sort((a, b) => mapName(a.file).localeCompare(mapName(b.file)))
  .forEach((t) => console.log(`  ${mapName(t.file).padEnd(28)}${JSON.stringify(t.declared)} -> ${JSON.stringify(t.published)}`));

unanswered.forEach((t) => console.log(`  ! ${mapName(t.file).padEnd(28)}${JSON.stringify(t.declared)}  service unreachable`));

if (!drop) {
  console.log('\nPass --drop-identical to remove the titles that match, or --markdown for the upstream table.');
  process.exit(0);
}

let removed = 0;
const byFile = {};
identical.forEach((t) => {
  byFile[t.file] = byFile[t.file] || [];
  byFile[t.file].push(t);
});

for (const [file, list] of Object.entries(byFile)) {
  const p = path.join(DEFS, file);
  let text = fs.readFileSync(p, 'utf8');

  for (const t of list) {
    if (!t.defsName) continue;

    const line = new RegExp('^[ \t]*title:[ \t]*' + t.defsName + '\.' + t.key + '\.name,[ \t]*\r?\n', 'm');

    while (line.test(text)) {
      text = text.replace(line, '');
      removed += 1;
    }
  }

  fs.writeFileSync(p, text, { encoding: 'utf8' });
}

console.log(`\n${removed} hard-coded titles removed; ${differs.length} kept because the service name differs.`);
