import * as fs from 'fs';
import * as path from 'path';

import { expect, HEAVY, test } from './fixtures';
import { MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';
import { loadBuilderTargets } from './builder-destinations';
import { environmentIsDevelopment } from './gis-hosts';

/**
 * Every map lists, draws and keys the layers its definition says it has (#1986).
 *
 * Three checks, one test per map the environment lists, each read once the map has finished drawing
 * (`probe.ready` and `probe.drawing === false`, docs/testing-maps.md):
 *
 * 1. **Listed.** Every layer the definition lists (`listMode` not `'hide'`) is in the sidebar's Layers
 *    list. The definitions cannot be imported here (`global-setup.ts` says why), so they are read from
 *    `declared-layers.generated.json`, which `declared-layers.spec.ts` in `ts-events-ngx` keeps equal to
 *    them. Each is found on the map by id, then in the list by the title it has there, so a layer that
 *    never reaches the map is caught too. The main map has no definition there, so every layer its view
 *    holds that is not hidden from the list must be in it instead. Not at a builder destination, where
 *    neither says what the choices leave listed. No title is listed twice in one group (#2453).
 * 2. **Drawn.** Every layer that holds features in the current extent draws at least one of them: the
 *    features are given to the layer's own renderer until one comes back with a symbol. A layer that is
 *    on is asked through its layer view, what the map holds; one that is off, as every layer on the main
 *    map loads, is asked through its service for the same extent, what it would draw if switched on. A layer
 *    can load, answer every query and hold 73 lots and still draw none of them, which Business Parking
 *    did on production (#1981): its renderer keyed on a field the service does not publish. A layer
 *    holding nothing in the current extent is not a failure.
 *
 *    At least one, not every one: many parking maps load every space or lot and let the renderer pick
 *    the ones to draw (Timed Parking drew 4 of the first 25 spaces it held, by design). How many of a
 *    layer's features have a symbol is recorded in the annotations instead.
 * 3. **Keyed.** Every layer that is on in the Layers list, and is not kept out of the legend by design
 *    (`legendEnabled: false`), has a legend entry holding at least one symbol: a row counts only if it
 *    holds an `img`, `canvas`, `svg` or an element with a background image. Freshman Selectable Parking
 *    listed both its layers in the legend by name with no symbol under either on production (#1987).
 *    A layer that failed to load or serves no features at all is left to `maps.spec.ts`. An entry is
 *    found by its title, or, where the legend gives it none, by a row labelled with the layer's title; a
 *    layer in a group, by its own entry inside the group's.
 *
 * A map with a version published only on the development GIS server is checked against that version where
 * the server is read, and there its Layers list must show nothing else: a layer the new version drops is
 * one the map owner removed, and must be seen to be gone (#2001). Not at a builder destination, whose
 * declared layers leave out every one a choice switches.
 *
 * A map that never finishes drawing fails, saying so, and so does one with no layers at all: a route the
 * application does not know still renders the shell, and must not pass as a map with nothing switched on.
 *
 * A map behind a builder is checked at the destinations `tools/builder-inventory` recorded for it, one per
 * distinct layer set, as `maps.spec.ts` loads them (`builder-destinations.ts`). Its own route only lands on
 * the builder, so these maps were skipped until #2467, and the baseball maps lost their symbols that
 * morning with every test on them passing (#2453). A builder map the inventory has no destination for, as on
 * an environment it was not captured against, is still skipped. Read-only, so safe against production.
 */

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/**
 * Written by `libs/ts/events/ngx/src/lib/definitions/declared-layers.spec.ts`: by map id, the ids of the
 * layers each map's Layers list must show.
 */
const declared: Record<string, { layerList: boolean; layers: string[]; developmentLayers?: string[] }> = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'declared-layers.generated.json'), 'utf8')
);

/** Whether this environment reads the development GIS server, and so draws a map's development version. */
const DEVELOPMENT_GIS = environmentIsDevelopment(manifest.baseUrl);

/** Layers this environment is allowed to fail to load (environments.json); not checked here. */
const ALLOWED_LAYER_FAILURES = (process.env.AGGIEMAP_SMOKE_ALLOWED_LAYER_FAILURES ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

/**
 * Layers this environment is allowed to fail on one map only, by map path and then by layer title or id, each
 * with the issue that tracks it (environments.json `allowedMapLayerFailures`, #2350). Narrower than
 * `ALLOWED_LAYER_FAILURES`, which tolerates a title on every map: the development athletics views lack fields
 * that seven sports maps filter on (#2209), and tolerating "Accessible Parking Spaces" everywhere would hide the
 * same layer failing on any other map. Read from environments.json by base URL, as `services.spec.ts` does.
 */
const ALLOWED_MAP_LAYER_FAILURES: Record<string, Record<string, string>> = (() => {
  const environments: Record<string, { baseUrl: string; allowedMapLayerFailures?: Record<string, Record<string, string>> }> =
    JSON.parse(fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8'));
  const normalised = manifest.baseUrl.replace(/\/$/, '');

  return (
    Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === normalised)?.allowedMapLayerFailures ??
    {}
  );
})();

/** Features asked for at a time, and the most of one layer's given to its renderer. */
const PAGE = 100;
const MOST = 2_000;

/** Layers the legend keys by design without their title, so they cannot be found by it; each with why. */
const UNTITLED_IN_LEGEND: Record<string, string> = {
  'Safety First':
    "legend-collection.component.ts draws the sports parking maps' Safety First layer as its message alone, with no title"
};

/** The legend is drawn after the map; how long it has to key every layer that is on. */
const LEGEND_MS = 45_000;

interface MapLayer {
  title: string;
  id: string;
  type: string;
  /** On, and every group above it on too. */
  on: boolean;
  /** Not in a group: what the Layers list shows at its top level. */
  topLevel: boolean;
  listMode: string;
  legendEnabled: boolean;
  error: string | null;
  /**
   * Features of the layer view given to the renderer, and how many came back with a symbol; null where
   * not asked. Stops early once a symbol is found, so `checked` is not the number held.
   */
  checked: number | null;
  drawn: number | null;
  /** Why the renderer could not be asked, where it could not. */
  queryError: string | null;
}

/** A Layers list item's text is the layer's title, followed by ` - ` and its note where it has one. */
function isListItemFor(item: string, layer: MapLayer): boolean {
  return layer.title !== '' && (item === layer.title || item.startsWith(`${layer.title} - `));
}

interface LegendEntry {
  title: string;
  /** Where the entry has no title, its rows' labels. */
  labels: string[];
  rows: number;
  symbols: number;
}

/**
 * The maps that load every parking space on campus (#1897's family) and so take longest to settle. They run in
 * the heavy lane, after everything else and two at a time (#1716), so the settle limit below measures the map
 * rather than how much CPU five other map loads leave it: on a 24-CPU machine Maintenance Parking settled in
 * 41-47 s with six workers, against 134-147 s on the loaded machines that failed it (#2008). The limit is not
 * raised or scaled by worker count, so a map that does get slow still fails.
 */
const HEAVY_MAPS = new Set(['/parking/maintenance-parking', '/parking/service-loading']);

const builderTargets = loadBuilderTargets(manifest);

/** One case per map, or per recorded destination for a map behind a builder; `loadPath` is what is opened. */
const cases = manifest.maps.flatMap((mapPath): { mapPath: string; loadPath: string; title: string; borrowedFrom?: string }[] => {
  const targets = builderTargets.get(mapPath) ?? [];

  return targets.length === 0
    ? [{ mapPath, loadPath: mapPath, title: mapPath }]
    : targets.map(({ target, label, borrowedFrom }) => ({
        mapPath,
        loadPath: target,
        title: `${mapPath} (${label})`,
        borrowedFrom
      }));
});

for (const { mapPath, loadPath, title, borrowedFrom } of cases) {
  test(`${title} lists, draws and keys every layer it shows`, HEAVY_MAPS.has(mapPath) ? HEAVY : {}, async ({ page }) => {
    test.setTimeout(330_000);
    await blockAnalytics(page);
    await page.goto(loadPath, { waitUntil: 'domcontentloaded' });

    // A builder-gated map never draws until a choice is made, so one with no recorded destination is skipped.
    const settled = await page
      .waitForFunction(
        () => {
          const probe = (window as unknown as Record<string, { ready?: boolean; drawing?: boolean } | undefined>)[
            '__tamuGiscMapProbe'
          ];

          return (
            location.pathname.includes('/builder/') ||
            (probe?.ready === true && probe.drawing === false && document.querySelector('arcgis-map') !== null)
          );
        },
        null,
        // Maintenance and Service Parking load every parking space on campus, and finished drawing after
        // 134 and 147 seconds with five other maps loading beside them on 20 October.
        { timeout: 240_000, polling: 1_000 }
      )
      .then(() => true)
      .catch(() => false);

    test.skip(
      page.url().includes('/builder/') && loadPath === mapPath,
      `${mapPath} is behind a builder and the inventory has no destination for it here, so none of its layers ` +
        `can be checked. Re-run tools/builder-inventory against this environment.`
    );
    if (borrowedFrom !== undefined) {
      test.info().annotations.push({ type: 'builder inventory', description: `destination recorded on ${borrowedFrom} (#1134)` });
    }
    // A borrowed destination that does not land here is a difference between environments, not a fault.
    test.skip(
      borrowedFrom !== undefined && page.url().includes('/builder/'),
      `${loadPath} was recorded on ${borrowedFrom} and does not reach the map here; skipped rather than failed (#1134)`
    );
    expect(
      page.url().includes('/builder/'),
      `${loadPath} went back to the builder, so its recorded destination no longer reaches the map`
    ).toBe(false);
    if (!settled) {
      const state = await page.evaluate(() => {
        const probe = (window as unknown as Record<string, { ready?: boolean; drawing?: boolean } | undefined>)[
          '__tamuGiscMapProbe'
        ];

        return `ready=${probe?.ready} drawing=${probe?.drawing} map=${document.querySelector('arcgis-map') !== null}`;
      });

      expect(
        settled,
        `${mapPath} never finished drawing within 240 seconds (${state}), so none of its layers was checked`
      ).toBe(true);
    }

    const layers: MapLayer[] = await page.evaluate(
      async ({ pageSize, most }) => {
        // The few ArcGIS members read here, declared rather than imported: the SDK's types are not
        // part of this suite (tsconfig.json).
        interface Graphic {
          attributes: Record<string, unknown>;
        }
        interface Renderer {
          getSymbolAsync?(graphic: Graphic, options: object): Promise<unknown>;
        }
        interface Layer {
          id: string;
          title?: string;
          type: string;
          visible: boolean;
          listMode: string;
          legendEnabled?: boolean;
          loadError?: { message?: string } | null;
          renderer?: Renderer;
          layers?: { toArray(): Layer[] };
          queryFeatures?(query: object): Promise<{ features: Graphic[] }>;
        }
        interface View {
          scale: number;
          extent: unknown;
          spatialReference: unknown;
          map: { layers: { toArray(): Layer[] } };
          whenLayerView(layer: Layer): Promise<{
            queryFeatures(query: object): Promise<{ features: Graphic[] }>;
          }>;
        }

        const view = (document.querySelector('arcgis-map') as unknown as { view: View }).view;
        const out: MapLayer[] = [];

        const walk = async (collection: { toArray(): Layer[] }, parentOn: boolean, topLevel: boolean): Promise<void> => {
          for (const layer of collection.toArray()) {
            const on = parentOn && layer.visible;
            const renderer = layer.renderer;
            const entry: MapLayer = {
              title: layer.title ?? '',
              id: layer.id,
              type: layer.type,
              on,
              topLevel,
              listMode: layer.listMode,
              legendEnabled: layer.legendEnabled !== false,
              error: layer.loadError ? String(layer.loadError.message ?? layer.loadError) : null,
              checked: null,
              drawn: null,
              queryError: null
            };

            // On, what its layer view holds; off, what its service holds in the same extent.
            const source = on ? null : layer.queryFeatures ? layer : undefined;

            if (!entry.error && renderer?.getSymbolAsync && source !== undefined) {
              try {
                const holder = source ?? (await view.whenLayerView(layer));
                const extent = source ? { geometry: view.extent } : {};
                let checked = 0;
                let drawn = 0;

                // A page at a time, until a symbol has been found in a full page or there is nothing left.
                for (let start = 0; start < most && !(drawn > 0 && checked >= pageSize); start += pageSize) {
                  const { features } = await holder.queryFeatures!({
                    ...extent,
                    where: '1=1',
                    outFields: ['*'],
                    start,
                    num: pageSize
                  });

                  for (const graphic of features) {
                    const symbol = await renderer.getSymbolAsync(graphic, {
                      scale: view.scale,
                      spatialReference: view.spatialReference
                    });

                    checked++;
                    drawn += symbol ? 1 : 0;
                  }

                  if (features.length < pageSize) {
                    break;
                  }
                }

                entry.checked = checked;
                entry.drawn = drawn;
              } catch (error) {
                entry.queryError = String((error as Error)?.message ?? error);
              }
            }

            out.push(entry);

            if (layer.layers) {
              await walk(layer.layers, on, false);
            }
          }
        };

        await walk(view.map.layers, true, true);

        return out;
      },
      { pageSize: PAGE, most: MOST }
    );

    const counted: Record<string, { count: number | null; error: string | null }> = await page.evaluate(async () => {
      const probe = (
        window as unknown as Record<
          string,
          {
            snapshot(): Promise<{
              layers: Array<{ id: string; featureCount: number | null; featureCountError: string | null }>;
            }>;
          }
        >
      )['__tamuGiscMapProbe'];

      return Object.fromEntries(
        (await probe.snapshot()).layers.map((layer) => [
          layer.id,
          { count: layer.featureCount, error: layer.featureCountError ?? null }
        ])
      );
    });

    const featureCounts: Record<string, number | null> = Object.fromEntries(
      Object.entries(counted).map(([id, c]) => [id, c.count])
    );

    test.info().annotations.push({
      type: 'layers',
      description: layers
        .map(
          (l) =>
            `${l.title || l.id} [${l.type}] on=${l.on} list=${l.listMode} count=${
              counted[l.id]?.error != null ? `FAILED (${counted[l.id]?.error})` : (featureCounts[l.id] ?? 'n/a')
            }` +
            (l.checked === null ? '' : ` drawn=${l.drawn}/${l.checked}`) +
            (l.error ? ` error=${l.error}` : '') +
            (l.queryError ? ` queryError=${l.queryError}` : '')
        )
        .join('\n')
    });

    const knownHere = ALLOWED_MAP_LAYER_FAILURES[mapPath] ?? {};
    const knownOnThisMap = (l: MapLayer) => knownHere[l.title] ?? knownHere[l.id];
    const tolerated = (l: MapLayer) =>
      ALLOWED_LAYER_FAILURES.includes(l.title) || ALLOWED_LAYER_FAILURES.includes(l.id) || knownOnThisMap(l) !== undefined;

    // A failure known on this map is suppressed, not hidden: recorded, and flagged once it stops failing.
    for (const l of layers.filter((layer) => knownOnThisMap(layer) !== undefined)) {
      const failing =
        l.error !== null ||
        l.queryError !== null ||
        counted[l.id]?.error != null ||
        ((l.checked ?? 0) > 0 && l.drawn === 0);

      test.info().annotations.push({
        type: failing ? 'known failure' : 'known failure passes',
        description: failing
          ? `${l.title || l.id}: ${knownOnThisMap(l)}`
          : `${l.title || l.id} passes again on ${mapPath}; remove it from allowedMapLayerFailures (${knownOnThisMap(l)})`
      });
    }

    expect(layers.length, `${mapPath} has no layers at all: it is not a map this suite can check`).toBeGreaterThan(0);

    // 1. Listed: every layer the definition lists is in the Layers list; on a map with no definition (the
    // main map), every top-level layer its view holds that is not hidden from the list.
    const definition = declared[mapPath.split(/[/?#]/)[2] ?? ''];
    const layerList = definition?.layerList ?? true;

    if (layerList) {
      const listed = (await page.locator('tamu-gisc-layer-list-item .layer-item > p').allTextContents()).map((text) =>
        text.trim()
      );
      const development = DEVELOPMENT_GIS ? definition?.developmentLayers : undefined;
      // Not at a builder destination, where nothing says what the list should hold: the declared lists hold
      // every choice's layers (Gameday's) or none of the ones a choice switches (Baseball's are `[]`), and the
      // view also holds the main map's layers, which an event map leaves out of its list by design.
      const ids =
        loadPath !== mapPath
          ? []
          : (development ?? definition?.layers ?? layers.filter((l) => l.topLevel && l.listMode !== 'hide').map((l) => l.id));
      const missing = ids
        .filter((id) => !ALLOWED_LAYER_FAILURES.includes(id))
        .map((id) => ({ id, layer: layers.find((l) => l.id === id) }))
        .filter(
          ({ layer }) => layer === undefined || (!tolerated(layer) && !listed.some((item) => isListItemFor(item, layer)))
        )
        .map(({ id, layer }) => (layer === undefined ? `${id}: never reached the map` : `${layer.title || id}: not listed`));

      expect
        .soft(
          missing,
          `${mapPath}: layers ${definition ? 'its definition lists' : 'the map holds'} that the Layers list does not`
        )
        .toEqual([]);

      // Each listed once among its siblings: two of one title is one service layer added twice, which draws
      // it twice. The Accessible Baseball Map listed "Baseball Event Parking Lots" twice after its service was
      // republished (#2453), with every other check here passing. Not across groups: Move-In lists "No
      // Roadside Parking" under both its streets and its points of interest, two layers by design.
      const repeated = await page.evaluate(() =>
        Array.from(new Set(Array.from(document.querySelectorAll('tamu-gisc-layer-list-item')).map((i) => i.parentElement)))
          .flatMap((parent) => {
            const titles = Array.from(parent?.children ?? [])
              .filter((child) => child.matches('tamu-gisc-layer-list-item'))
              .map((child) => child.querySelector(':scope > .layer-item > p')?.textContent?.trim() ?? '');

            return titles.filter((title, index) => title !== '' && titles.indexOf(title) !== index);
          })
      );

      expect.soft(repeated, `${mapPath}: layers the Layers list shows more than once`).toEqual([]);

      // Not at a builder destination: the declared lists leave out every layer a choice switches, which on a
      // builder map can be all of them (Baseball's are `[]`), so there they are a floor, not the whole list.
      if (development && loadPath === mapPath) {
        const kept = layers.filter((l) => development.includes(l.id));

        expect
          .soft(
            listed.filter((item) => !kept.some((layer) => isListItemFor(item, layer))),
            `${mapPath}: layers in the Layers list that its development version does not have`
          )
          .toEqual([]);
      }
    }

    // 2. Drawn: every layer that holds features in this extent, on or off, draws at least one of them.
    const undrawn = layers
      .filter((l) => !tolerated(l) && (l.queryError !== null || ((l.checked ?? 0) > 0 && l.drawn === 0)))
      .map((l) =>
        l.queryError !== null
          ? `${l.title || l.id}: its features could not be asked (${l.queryError})`
          : `${l.title || l.id}: none of the ${l.checked} features it holds${l.on ? '' : ' (off; asked of its service)'} has a symbol`
      );

    expect.soft(undrawn, `${mapPath}: layers that hold features their renderer draws nothing for`).toEqual([]);

    // 2b. Counted: a layer whose count query failed may be drawing short, and must not pass as "n/a".
    //
    // This is the check that was missing on 22 October 2026, when the accessible entrances service
    // failed about half the queries the map made (#2080). The map drew a third of its markers short,
    // every count came back null, the annotation said "n/a", and the suite passed. The maintainer
    // found it by looking at the map, which is the thing this suite exists to do instead.
    //
    // Soft, like the checks around it, so one failing layer still reports the rest of the map.
    const uncounted = layers
      .filter((l) => !tolerated(l) && counted[l.id]?.error != null)
      .map((l) => `${l.title || l.id}: its features could not be counted (${counted[l.id]?.error})`);

    expect
      .soft(uncounted, `${mapPath}: layers whose feature count failed, so they may be drawing short`)
      .toEqual([]);

    // 3. Keyed: every layer on in the Layers list has a legend entry with a symbol in it.
    if ((await page.locator('tamu-gisc-legend').count()) > 0) {
      const onInList = (await page.locator('tamu-gisc-layer-list-item .layer-item.visible > p').allTextContents()).map(
        (text) => text.trim()
      );
      const expected = onInList.filter((item) => {
        const layer = layers.find((l) => isListItemFor(item, l));

        // A list item with no map layer behind it is a group heading or similar; nothing to key.
        return (
          layer !== undefined &&
          !(layer.title in UNTITLED_IN_LEGEND) &&
          layer.legendEnabled &&
          layer.error === null &&
          featureCounts[layer.id] !== 0 &&
          !tolerated(layer)
        );
      });

      // Each layer's entry is a top-level collection: its title, its rows' labels where it has no title,
      // and every row under it, its child layers' included.
      const scanLegend = async (): Promise<LegendEntry[]> =>
        await page.evaluate(() => {
          const holdsSymbol = (row: Element): boolean =>
            row.querySelector('img, canvas, svg') !== null ||
            [row, ...Array.from(row.querySelectorAll('*'))].some((el) => {
              const image = getComputedStyle(el).backgroundImage;

              return image !== '' && image !== 'none';
            });
          const text = (el: Element | null) => el?.textContent?.trim().replace(/\s+/g, ' ') ?? '';

          // Every collection, a group's nested ones included: a layer in a group (Move-In's) has its entry
          // inside the group's, under its own title.
          return Array.from(
            document.querySelectorAll('tamu-gisc-legend .sidebar-component-content-container tamu-gisc-legend-collection')
          ).map((collection) => {
            const title = text(
              collection.querySelector(':scope > .legend-collection > .collection-group-title .collection-group-title-text')
            );
            const rows = Array.from(collection.querySelectorAll('.collection-group-content .legend-info'));
            const labels = title
              ? []
              : Array.from(
                  collection.querySelectorAll('.legend-info .label, .legend-info .group-title, .element-parent-name')
                ).map((label) => text(label).replace(/^(expand_more|chevron_right) /, ''));

            return { title, labels, rows: rows.length, symbols: rows.filter(holdsSymbol).length };
          });
        });

      const entryFor = (entries: LegendEntry[], title: string): LegendEntry | undefined =>
        entries.find((entry) => entry.title === title) ??
        entries.find((entry) => entry.title === '' && entry.labels.includes(title));

      const unkeyed = (entries: LegendEntry[]): string[] =>
        expected
          .filter((title) => (entryFor(entries, title)?.symbols ?? 0) === 0)
          .map((title) => {
            const entry = entryFor(entries, title);

            return entry ? `${title}: listed with ${entry.rows} rows and no symbol` : `${title}: not in the legend`;
          });

      let entries = await scanLegend();

      for (const started = Date.now(); unkeyed(entries).length > 0 && Date.now() - started < LEGEND_MS;) {
        await page.waitForTimeout(1_000);
        entries = await scanLegend();
      }

      test.info().annotations.push({
        type: 'legend',
        description: entries
          .map((e) => `${e.title || `(untitled: ${e.labels.join(', ')})`} rows=${e.rows} symbols=${e.symbols}`)
          .join('\n')
      });

      expect.soft(unkeyed(entries), `${mapPath}: layers on in the Layers list with no symbol in the legend`).toEqual([]);
    }
  });
}
