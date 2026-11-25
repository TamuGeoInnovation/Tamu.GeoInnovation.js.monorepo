#!/usr/bin/env bash
# Tests scripts/event-map-monitors.mjs: the request, name and keyword it gives each layer, and that the committed
# layer file still holds the five rows verified live on production. No network; runs in a few seconds:
#
#   bash scripts/event-map-monitors.test.sh
#
# Exits non-zero, naming each failed case, if a monitor would request the wrong address, take its keyword from an
# error body (and so stay green on a broken layer), or if the men's and women's basketball rows checked on 25 November
# 2026 (#497) have changed.
set -uo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
failed=0

# Node where there is one (CI, and the pre-PR check's container, which has no Docker inside it), otherwise in Docker
# (these machines have no host Node).
node_in_docker() {
  if command -v node >/dev/null 2>&1; then
    (cd "$tmp" && node "$@")
  else
    MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd "$tmp" && pwd -W 2>/dev/null || pwd):/t" -w /t node:24.22.3 node "$@"
  fi
}

cp "$here/event-map-monitors.mjs" "$tmp/monitors.mjs"
cp "$here/event-map-layers.generated.json" "$tmp/event-map-layers.generated.json"

# Every case in one container: each prints `<name>\t<result>`, compared below.
cat >"$tmp/run.mjs" <<'JS'
import { readFileSync } from 'node:fs';
import { keywordFrom, monitorRows, monitorUrlFor, shortName, skippedLines, uniqueRows } from './monitors.mjs';

const out = (name, value) => console.log(`${name}\t${JSON.stringify(value) ?? ''}`);
const MBSKT = 'https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer';
const WBB = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer';

out('arcgis-request', monitorUrlFor(`${MBSKT}/0`));
out('geojson-request', monitorUrlFor('https://api.aggiemap.tamu.edu/dining/locations/geojson'));
out('short-layer', shortName(`${MBSKT}/2`));
out('short-service', shortName('https://gis.tamu.edu/arcgis/rest/services/Hosted/HSI/VectorTileServer'));
out('short-other', shortName('https://api.aggiemap.tamu.edu/dining/locations/geojson'));

out('keyword-layer', keywordFrom({ currentVersion: 11.3, id: 0, name: 'Basketball Icons', type: 'Feature Layer' }));
out('keyword-mapserver', keywordFrom({ mapName: 'Layers', layers: [] }));
out('keyword-geojson', keywordFrom({ type: 'FeatureCollection', features: [] }));
out('keyword-error', keywordFrom({ error: { code: 500, message: 'Service not started', details: [] } }));
out('keyword-error-with-name', keywordFrom({ error: { code: 400, message: 'Invalid', name: 'x' }, name: 'Basketball Icons' }));
out('keyword-nothing', keywordFrom(undefined));

const fixture = {
  maps: {
    'mens-basketball': {
      name: "Men's Basketball",
      layers: [{ id: 'gates', url: `${MBSKT}/0` }, { id: 'shared', url: `${WBB}/0` }]
    },
    'womens-basketball': { name: "Women's Basketball", layers: [{ id: 'accessible', url: `${WBB}/0` }] }
  },
  skipped: {
    developmentOnlyMaps: [{ map: 'ncaa-volleyball', reason: '#2713' }],
    retiredMaps: [{ map: 'savannah-bananas-parking', reason: 'retired' }],
    developmentOnlyLayers: []
  }
};
const names = new Map([[`${MBSKT}/0`, 'Basketball Icons'], [`${WBB}/0`, 'Accessible Parking Spaces']]);
const rows = monitorRows(fixture, names);
out('row', rows[0]);
out('same-url-same-monitor', rows[1].monitor === rows[2].monitor);
out('unique', uniqueRows(rows).map((row) => [row.monitor, row.maps]));
out('no-keyword-row', monitorRows(fixture)[0].keyword);
out('skipped', skippedLines(fixture));

// The committed file, as the spec wrote it: the five rows verified live on production (#497).
const generated = JSON.parse(readFileSync('event-map-layers.generated.json', 'utf8'));
const urls = (map) => generated.maps[map].layers.map((layer) => layer.url);
out('mens-basketball', urls('mens-basketball'));
out('womens-basketball', urls('womens-basketball'));
out('no-development-host', Object.values(generated.maps).flatMap((map) => map.layers).filter((l) => new URL(l.url).hostname.includes('dev')).length);
out('retired-left-out', ['argentina-vs-honduras-2026', 'savannah-bananas-parking', 'softball-regionals-2025', 'troubadour-festival-2025'].map((id) => [id in generated.maps, generated.skipped.retiredMaps.some((skip) => skip.map === id)]));
JS

results="$(node_in_docker run.mjs 2>&1)"

check() {
  local name="$1" want="$2"
  local got
  got="$(printf '%s\n' "$results" | awk -F '\t' -v n="$name" '$1 == n { print $2 }')"
  if [ "$want" = "$got" ]; then
    printf 'ok   %s\n' "$name"
  else
    printf 'FAIL %s\n       want: %s\n        got: %s\n' "$name" "$want" "$got"
    failed=$((failed + 1))
  fi
}

check arcgis-request '"https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/0?f=json"'
check geojson-request '"https://api.aggiemap.tamu.edu/dining/locations/geojson"'
check short-layer '"MBskt_view 2"'
check short-service '"HSI"'
check short-other '"api.aggiemap.tamu.edu/dining/locations/geojson"'

check keyword-layer '"Basketball Icons"'
check keyword-mapserver '"Layers"'
check keyword-geojson '"FeatureCollection"'
# The whole point of a keyword: an ArcGIS error answers HTTP 200 (#2510), and its body must never supply one.
check keyword-error ''
check keyword-error-with-name ''
check keyword-nothing ''

check row '{"map":"mens-basketball","mapName":"Men'"'"'s Basketball","layer":"gates","url":"https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/0","monitorUrl":"https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/0?f=json","monitor":"AggieMap: MBskt_view 0 (Basketball Icons)","keyword":"Basketball Icons"}'
check same-url-same-monitor 'true'
check unique '[["AggieMap: MBskt_view 0 (Basketball Icons)",["mens-basketball"]],["AggieMap: WomensBasketballParking_view 0 (Accessible Parking Spaces)",["mens-basketball","womens-basketball"]]]'
check no-keyword-row 'null'
check skipped '["Skipped 1 development-only map(s), 1 retired map(s) and 0 development-only layer(s); a monitor would alert on something correctly absent from production.","  map ncaa-volleyball: #2713","  map savannah-bananas-parking: retired"]'

check mens-basketball '["https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/0","https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/1","https://gis.tamu.edu/arcgis/rest/services/Hosted/MBskt_view/FeatureServer/2"]'
check womens-basketball '["https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer/0","https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/WomensBasketballParking_view/FeatureServer/1"]'
check no-development-host '0'
# The four retired maps whose services are stopped (a44): skipped and named, never listed.
check retired-left-out '[[false,true],[false,true],[false,true],[false,true]]'

# An unknown option is refused rather than ignored, so a typo doesn't print a list that looks right.
node_in_docker monitors.mjs --offlne >/dev/null 2>&1
code=$?
if [ "$code" = 2 ]; then printf 'ok   unknown-option\n'; else printf 'FAIL unknown-option\n       want: exit 2\n        got: exit %s\n' "$code"; failed=$((failed + 1)); fi

# Offline, the CLI prints every map and the skip, without asking any service.
offline="$(node_in_docker monitors.mjs --offline 2>&1)"
if printf '%s\n' "$offline" | grep -q '^mens-basketball .*MBskt_view/FeatureServer/0' && printf '%s\n' "$offline" | grep -q 'map ncaa-volleyball:'; then
  printf 'ok   offline-table\n'
else
  printf 'FAIL offline-table\n%s\n' "$(printf '%s\n' "$offline" | tail -n 5)"
  failed=$((failed + 1))
fi

if [ "$failed" -ne 0 ]; then
  printf '\n%d case(s) failed.\n' "$failed" >&2
  exit 1
fi
printf '\nAll cases passed.\n'
