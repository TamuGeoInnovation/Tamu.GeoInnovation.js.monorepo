#!/usr/bin/env node
// Lists the uptime monitors every AggieMap event map needs: one per production layer it draws (#3674).
//
//   node scripts/event-map-monitors.mjs            # a table, each layer's name read from its service
//   node scripts/event-map-monitors.mjs --json     # the same rows, for a machine
//   node scripts/event-map-monitors.mjs --unique   # one row per URL, naming every map that reads it
//   node scripts/event-map-monitors.mjs --offline  # without asking the services; no keywords
//
// Why. "Any time that we create a new Aggie Map event, we have to remember to build new monitors for the layers that
// it depends on" (#497). Remembering is the fault: every map's definition already says which layers it draws, so the
// list is read from there instead.
//
// Where the layers come from. The definitions are TypeScript with Angular inside, which a script can't import, so
// `libs/ts/events/ngx/src/lib/definitions/event-map-monitors.spec.ts` resolves them as production does and writes
// `scripts/event-map-layers.generated.json`. A definition change fails that spec until the file is rewritten with
// `nx test ts-events-ngx -u`, so this list can't drift from the maps. The URLs are production's, resolved through
// `Connections`. They are never built by swapping a host: men's basketball is a different host and a different service
// name on each environment.
//
// The keyword. An ArcGIS layer answers HTTP 200 even when it is broken, with the error in the body (#2510), so a
// monitor that only checks the status stays green. Each monitor therefore asks for `?f=json` and looks for the layer's
// own name, which a broken layer's error body doesn't contain. The name is read from the service itself, now.
//
// This only prints. It creates and changes nothing in Kuma, which is the maintainer's to change (#1525).
// Tested by scripts/event-map-monitors.test.sh.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GENERATED = join(dirname(fileURLToPath(import.meta.url)), 'event-map-layers.generated.json');

/** Whether a URL is an ArcGIS REST resource, which answers `?f=json` with its description. */
export const isArcgis = (url) => /\/rest\/services\//.test(url);

/** The address a monitor requests: an ArcGIS resource's JSON description, or the URL itself. */
export const monitorUrlFor = (url) => (isArcgis(url) ? `${url}?f=json` : url);

/** `<service> <layer>` from an ArcGIS URL (`MBskt_view 0`), or the host and path for anything else. */
export function shortName(url) {
  const match = url.match(/\/([^/]+)\/(?:FeatureServer|MapServer|VectorTileServer|ImageServer)(?:\/(\d+))?$/);
  if (match) {
    return match[2] === undefined ? match[1] : `${match[1]} ${match[2]}`;
  }
  const { hostname, pathname } = new URL(url);
  return `${hostname}${pathname}`;
}

/**
 * The text a healthy answer contains and a broken one doesn't: a layer's or service's own name, or `FeatureCollection`
 * for GeoJSON. Undefined for an error body, or anything else without one.
 */
export function keywordFrom(body) {
  if (!body || typeof body !== 'object' || body.error) {
    return undefined;
  }
  if (typeof body.name === 'string' && body.name) {
    return body.name;
  }
  if (typeof body.mapName === 'string' && body.mapName) {
    return body.mapName;
  }
  if (body.type === 'FeatureCollection') {
    return 'FeatureCollection';
  }
  return undefined;
}

/** The suggested monitor name. The same URL gets the same name, whichever map reads it. */
export const monitorName = (url, keyword) =>
  keyword ? `AggieMap: ${shortName(url)} (${keyword})` : `AggieMap: ${shortName(url)}`;

/** One row per map and layer, from the generated file, with each URL's keyword from `keywords` (url to keyword). */
export function monitorRows(generated, keywords = new Map()) {
  return Object.entries(generated.maps).flatMap(([map, { name, layers }]) =>
    layers.map((layer) => {
      const keyword = keywords.get(layer.url);
      return {
        map,
        mapName: name,
        layer: layer.id,
        url: layer.url,
        monitorUrl: monitorUrlFor(layer.url),
        monitor: monitorName(layer.url, keyword),
        keyword: keyword ?? null
      };
    })
  );
}

/** One row per URL, with every map that reads it. */
export function uniqueRows(rows) {
  const byUrl = new Map();
  for (const row of rows) {
    const existing = byUrl.get(row.url);
    if (existing) {
      existing.maps.push(row.map);
    } else {
      byUrl.set(row.url, {
        url: row.url,
        monitorUrl: row.monitorUrl,
        monitor: row.monitor,
        keyword: row.keyword,
        maps: [row.map]
      });
    }
  }
  return [...byUrl.values()];
}

/** What was left out, and why, as lines. */
export function skippedLines(generated) {
  const { developmentOnlyMaps, developmentOnlyLayers } = generated.skipped;
  return [
    `Skipped ${developmentOnlyMaps.length} development-only map(s) and ${developmentOnlyLayers.length} development-only layer(s); a monitor would alert on something correctly absent from production.`,
    ...developmentOnlyMaps.map((skip) => `  map ${skip.map}: ${skip.reason}`),
    ...developmentOnlyLayers.map((skip) => `  ${skip.map} / ${skip.layer}: ${skip.reason}`)
  ];
}

/** Each distinct URL's keyword, read from the service. A URL that can't be read is reported, not guessed. */
async function readKeywords(urls, { concurrency = 8, timeoutMs = 20000 } = {}) {
  const keywords = new Map();
  const failures = [];
  const queue = [...urls];

  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const response = await fetch(monitorUrlFor(url), { signal: AbortSignal.timeout(timeoutMs) });
        const body = await response.json().catch(() => undefined);
        const keyword = response.ok ? keywordFrom(body) : undefined;
        if (keyword) {
          keywords.set(url, keyword);
        } else {
          failures.push({ url, why: body?.error?.message ?? `HTTP ${response.status}, no name in the answer` });
        }
      } catch (error) {
        failures.push({ url, why: error.name === 'TimeoutError' ? `no answer in ${timeoutMs / 1000} s` : error.message });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return { keywords, failures };
}

function table(rows, columns) {
  const widths = columns.map(([title, key]) => Math.max(title.length, ...rows.map((row) => String(row[key] ?? '').length)));
  const line = (cells) =>
    cells
      .map((cell, i) => String(cell ?? '').padEnd(widths[i]))
      .join('  ')
      .trimEnd();
  return [
    line(columns.map(([title]) => title)),
    line(widths.map((w) => '-'.repeat(w))),
    ...rows.map((row) => line(columns.map(([, key]) => row[key])))
  ].join('\n');
}

async function main(argv) {
  const flags = new Set(argv);
  const unknown = [...flags].filter((flag) => !['--json', '--unique', '--offline'].includes(flag));
  if (unknown.length) {
    console.error(`Unknown option(s): ${unknown.join(' ')}. Use --json, --unique or --offline.`);
    return 2;
  }

  const generated = JSON.parse(readFileSync(GENERATED, 'utf8'));
  const urls = [...new Set(Object.values(generated.maps).flatMap((map) => map.layers.map((layer) => layer.url)))];
  const { keywords, failures } = flags.has('--offline') ? { keywords: new Map(), failures: [] } : await readKeywords(urls);

  const rows = monitorRows(generated, keywords);
  const output = flags.has('--unique') ? uniqueRows(rows).map((row) => ({ ...row, maps: row.maps.join(', ') })) : rows;

  if (flags.has('--json')) {
    console.log(JSON.stringify({ rows: output, skipped: generated.skipped, unreadable: failures }, null, 2));
  } else {
    const columns = flags.has('--unique')
      ? [
          ['Monitor', 'monitor'],
          ['Request', 'monitorUrl'],
          ['Keyword', 'keyword'],
          ['Maps', 'maps']
        ]
      : [
          ['Map', 'map'],
          ['Layer', 'layer'],
          ['Production URL', 'url'],
          ['Monitor', 'monitor'],
          ['Keyword', 'keyword']
        ];
    console.log(table(output, columns));
    console.log('');
    console.log(
      `${Object.keys(generated.maps).length} maps, ${rows.length} layers, ${urls.length} distinct URLs, so ${urls.length} monitors.`
    );
    for (const line of skippedLines(generated)) {
      console.log(line);
    }
    if (flags.has('--offline')) {
      console.log('Offline: no keywords. Without one, a monitor cannot tell a working layer from a broken one.');
    }
  }

  if (failures.length) {
    console.error(`\n${failures.length} URL(s) gave no name, so they have no keyword. Each is a layer to look at:`);
    for (const { url, why } of failures) {
      console.error(`  ${url}: ${why}`);
    }
  }

  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = await main(process.argv.slice(2));
}
