# Layer symbology inventory

Writes [`docs/layer-symbology.md`](../../docs/layer-symbology.md): every layer on every AggieMap map,
where its symbology comes from (the map's own renderer, the portal item's, or the service's), and
exactly what it draws, with an image of each symbol. Made for
[#1578](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1578), after Dining
and AggiePrint drew ArcGIS's default markers on production for two days (#1576).

**You do not need to run this to stay safe.** `test/smoke/aggiemap/maps.spec.ts` fails on any layer
drawing ArcGIS's default symbol. Run this to refresh the inventory, for instance before standardizing
symbols across maps, or after a batch of symbology changes.

It reads what the running map draws, through the map probe (`MapProbe.snapshot()` for each layer's
`symbology`, `MapProbe.renderers()` for its renderer), so the result is what a visitor sees after the
portal item's symbology (#1497) and every override, not what a definition file appears to say.

## Run it

1. Serve the app with the dev server (`aggiemap-dev`, as CLAUDE.md describes). `localhost` uses the
   production GIS services.
2. Make sure the smoke suite's map list exists: any local smoke run writes
   `test/smoke/aggiemap/map-manifest.generated.json`.
3. Collect every map, in the Playwright container, from the repository root:

   ```bash
   cp tools/layer-symbology/collect.js collect.tmp.js
   MSYS_NO_PATHCONV=1 docker run --rm --network host -v "$PWD:/work" -v tamu-js-smoke-nm:/work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble node collect.tmp.js http://localhost:4200 test/smoke/aggiemap/map-manifest.generated.json symbology-collected.json
   rm collect.tmp.js
   ```

   About a minute a map. Maps that open a builder load no map at their own route. Collect those a second
   time, through the direct links in `tools/builder-inventory/builder-inventory.generated.json` (its
   `shareTarget` for each destination, one for each distinct layer set), into a second file.

4. Write the inventory:

   ```bash
   python tools/layer-symbology/generate.py "symbology-collected.json;symbology-builder.json" . "<where it was collected from>" "<date, Central>"
   ```

   It rewrites `docs/layer-symbology.md`, `docs/layer-symbology/renderers.json` (every renderer in full,
   with embedded images replaced by the saved file's name) and `docs/layer-symbology/icons/` (each
   picture marker as an image, each fill, line and marker as a small SVG swatch).
