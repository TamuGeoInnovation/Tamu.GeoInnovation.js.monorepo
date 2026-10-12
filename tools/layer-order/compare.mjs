/**
 * Compares the layer-list order each map shows today with the order its publisher created (#1508).
 *
 *   node tools/layer-order/compare.mjs             # report
 *   node tools/layer-order/compare.mjs --markdown  # the table for the upstream issue
 *
 * A map's layer list is ordered one of two ways: alphabetically by title, or by the declaration
 * order of its `references` record when `referenceLayerListOrder: 'source'` is set. Neither is the
 * publisher's. The publisher's order is the one they built when they published the service - layer 0
 * first - and for a service published from a Pro map that is the order of layers in that map.
 *
 * Where the two already agree, a map can take the publisher's order and lose nothing: no visible
 * change, one less thing decided here. Where they disagree, changing it would move the list under
 * the people using the map, so it stays until the publisher says which order they want.
 *
 * Only maps whose references all resolve to layers of one feature service are comparable. A map
 * with group layers has no publisher order to compare against, because a group is this repository's
 * construct and the service knows nothing about it.
 */
import * as fs from 'fs';
import * as path from 'path';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DEFS = path.join(REPO, 'libs/ts/events/ngx/src/lib/definitions');
const markdown = process.argv.includes('--markdown');

const connections = fs.readFileSync(path.join(REPO, 'libs/aggiemap/ngx/common/src/lib/connections.ts'), 'utf8');

const hosts = {};
for (const m of connections.matchAll(/const (\w*[Hh]ost) = '([^']+)';/g)) {
  hosts[m[1]] = m[2];
}

/** Production service URLs, keyed by connection name, as the production branch sets them. */
const urls = {};
for (const m of connections.matchAll(/(\w+Url):\s*`([^`]+)`/g)) {
  let value = m[2];

  for (const [name, host] of Object.entries(hosts)) {
    value = value.split('${' + name + '}').join(host);
  }

  if (!urls[m[1]] && !value.includes('${')) {
    urls[m[1]] = value;
  }
}

const serviceNames = new Map();

const publishedName = async (url) => {
  if (!serviceNames.has(url)) {
    try {
      const res = await fetch(url + '?f=json');
      const json = await res.json();

      serviceNames.set(url, json.name || null);
    } catch {
      serviceNames.set(url, null);
    }
  }

  return serviceNames.get(url);
};

/**
 * Every `KEY: { ... }` entry of a definitions object, with the id, name and service index it
 * declares. Scanned by balancing braces rather than matched with one expression, because the
 * entries carry nested popup and native blocks.
 */
function definitionEntries(text) {
  const found = [];
  const re = /^ {2}(\w+):\s*\{/gm;
  let m;

  while ((m = re.exec(text)) !== null) {
    let depth = 0;
    let end = m.index + m[0].length - 1;

    for (let i = end; i < text.length; i += 1) {
      if (text[i] === '{') {
        depth += 1;
      } else if (text[i] === '}') {
        depth -= 1;

        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    const body = text.slice(m.index, end + 1);
    const id = (body.match(/\bid:\s*([\w.]+)/) || [])[1];
    const name = (body.match(/\bname:\s*'([^']*)'/) || [])[1];
    const url = body.match(/\burl:\s*`\$\{(\w+)\}\/(\d+)`/);

    if (id && name && url) {
      found.push({ key: m[1], id, name, root: url[1], index: Number(url[2]) });
    }
  }

  return found;
}

const rows = [];

for (const file of fs.readdirSync(DEFS).filter((f) => f.endsWith('.definitions.ts'))) {
  const text = fs.readFileSync(path.join(DEFS, file), 'utf8');
  const map = file.replace('.definitions.ts', '');
  // Two forms: a `LayerReferences` record mapping a key to a layer id, or the layer enum passed
  // straight through, in which case the enum's own declaration order is the order shown.
  const refBlock = text.match(/const \w*LayerReferences[^=]*=\s*\{([\s\S]*?)\n\};/);
  let refs;

  if (refBlock) {
    refs = [...refBlock[1].matchAll(/^\s*(\w+):\s*([\w.]+),?\s*$/gm)].map((r) => ({ key: r[1], id: r[2] }));
  } else {
    const passed = text.match(/references:\s*(\w+)\s*[,\n]/);

    if (!passed) {
      continue;
    }

    // To the closing brace on its own line: enum comments here contain `${...}`, so a [^}] run stops short.
    const enumBlock = text.match(new RegExp('enum ' + passed[1] + '\s*\{\n([\s\S]*?)\n\}'));

    if (!enumBlock) {
      continue;
    }

    refs = [...enumBlock[1].matchAll(/^\s*(\w+)\s*=/gm)].map((r) => ({ key: r[1], id: passed[1] + '.' + r[1] }));
  }

  if (refs.length < 2) {
    continue;
  }

  const orderMode = /referenceLayerListOrder:\s*'source'/.test(text) ? 'source' : 'title';
  const roots = {};

  for (const m of text.matchAll(/const (\w+)\s*=\s*Connections\.(\w+);/g)) {
    roots[m[1]] = urls[m[2]];
  }

  const defsName = (text.match(/const ([A-Za-z]*Definitions)[ :=]/) || [])[1];
  const declared = definitionEntries(text);
  const entries = [];

  for (const ref of refs) {
    const entry = declared.find((d) => d.id === ref.id);

    // A group layer is this repository's construct. Its definitions entry may still carry a url -
    // hs-graduation's groups point at layer 0 and 1 - but services publish layers, not groups, so a
    // list of groups has no publisher order to compare against. Found by substring rather than a
    // pattern: the id a group source declares sits a few characters after its type.
    const NEWLINE = String.fromCharCode(10);
    const needle =
      entry === undefined
        ? null
        : ["type: 'group',", '    id: ' + (defsName || '') + '.' + entry.key + '.id,'].join(NEWLINE);
    const isGroup = needle !== null && text.includes(needle);

    if (!entry || isGroup) {
      entries.push({ key: ref.key, title: entry ? entry.name : ref.key, index: null, service: null });
      continue;
    }

    const root = roots[entry.root];
    const url = root ? root + '/' + entry.index : null;
    const keepsOwnTitle = new RegExp('title:\\s*\\w*Definitions\\.' + entry.key + '\\.name,').test(text);
    const published = url ? await publishedName(url) : null;

    entries.push({
      key: ref.key,
      title: keepsOwnTitle || !published ? entry.name : published,
      index: entry.index,
      service: root
    });
  }

  const services = new Set(entries.map((e) => e.service).filter(Boolean));
  const comparable = services.size === 1 && entries.every((e) => e.index !== null);

  const today =
    orderMode === 'source'
      ? entries.map((e) => e.key)
      : [...entries].sort((a, b) => a.title.localeCompare(b.title)).map((e) => e.key);

  const byPublisher = [...entries].sort((a, b) => a.index - b.index).map((e) => e.key);

  rows.push({
    map,
    orderMode,
    comparable,
    count: entries.length,
    today,
    byPublisher,
    agrees: comparable && today.join('|') === byPublisher.join('|'),
    entries
  });
}

/**
 * Maps that order by `'source'` but whose reference list this tool could not resolve, so the gap is
 * stated rather than counted as coverage. Football and Tailgating hand their layer enum straight to
 * `references` and draw from several services at once, so there is no single publisher order to
 * compare against in any case.
 */
const unresolvedSourceOrdered = fs
  .readdirSync(DEFS)
  .filter((f) => f.endsWith('.definitions.ts'))
  .filter((f) => /referenceLayerListOrder:\s*'source'/.test(fs.readFileSync(path.join(DEFS, f), 'utf8')))
  .map((f) => f.replace('.definitions.ts', ''))
  .filter((m) => !rows.some((r) => r.map === m));

const titleOf = (row, key) => row.entries.find((e) => e.key === key).title;

const comparable = rows.filter((r) => r.comparable);
const agrees = comparable.filter((r) => r.agrees);
const differs = comparable.filter((r) => !r.agrees);
const notComparable = rows.filter((r) => !r.comparable);

if (markdown) {
  console.log('| Map | Order it shows today | Order the service publishes |');
  console.log('| --- | --- | --- |');

  differs.forEach((r) => {
    const a = r.today.map((k) => titleOf(r, k)).join(' → ');
    const b = r.byPublisher.map((k) => titleOf(r, k)).join(' → ');

    console.log(`| \`${r.map}\` | ${a} | ${b} |`);
  });

  process.exit(0);
}

console.log(`${rows.length} maps have an ordered reference list`);
console.log(`  already agree with the publisher: ${agrees.length}  (can take the publisher's order, nothing moves)`);
console.log(`  would move if changed:            ${differs.length}  (leave until the publisher decides)`);
console.log(`  not comparable (groups, or more than one service): ${notComparable.length}\n`);

console.log('== already agree ==');
agrees.forEach((r) => console.log(`  ${r.map.padEnd(28)}${r.count} layers, ordered by ${r.orderMode}`));

console.log('\n== would move ==');
differs.forEach((r) => {
  console.log(`  ${r.map}  (${r.count} layers, ordered by ${r.orderMode})`);
  console.log(`      today:     ${r.today.map((k) => titleOf(r, k)).join(' / ')}`);
  console.log(`      publisher: ${r.byPublisher.map((k) => titleOf(r, k)).join(' / ')}`);
});

console.log('\n== not comparable ==');
notComparable.forEach((r) => {
  const why =
    new Set(r.entries.map((e) => e.service).filter(Boolean)).size > 1
      ? 'more than one service'
      : 'group or unresolved reference';

  console.log(`  ${r.map.padEnd(28)}${r.count} references, ordered by ${r.orderMode}  (${why})`);
});

if (unresolvedSourceOrdered.length > 0) {
  console.log('\n== ordered by source, reference list not resolved by this tool ==');
  unresolvedSourceOrdered.forEach((m) => console.log(`  ${m}`));
  console.log('  These pass their layer enum directly and draw from several services, so no single');
  console.log('  publisher order exists to compare against. Checked by reading them (#996).');
}
