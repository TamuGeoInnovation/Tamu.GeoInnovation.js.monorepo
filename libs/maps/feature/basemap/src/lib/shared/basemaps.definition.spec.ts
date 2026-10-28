import * as fs from 'fs';
import * as path from 'path';

import * as definitions from './basemaps.definition';

/**
 * The campus basemap every map opens on, and what each environment offers (#1229, #2515).
 *
 * The vector tile basemap stayed off production until the maintainer made it production's default (#2515). Production
 * keeps the raster basemap in its gallery as a way back.
 *
 * - **The resolver.** `aggiemapBasemap()` gives every environment the vector tiles.
 * - **Nothing goes around it.** Outside the definition file, no code may name the vector tile service
 *   or either fixed campus basemap, so the next version can be gated by environment in one place, as this
 *   one was (#1227 put it on every environment by a direct import, and the main map, the gallery and both
 *   event maps showed it).
 */

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const DEFINITION = path.join('libs', 'maps', 'feature', 'basemap', 'src', 'lib', 'shared', 'basemaps.definition.ts');
// The vector tile cache development opens on. It moves when a newer one is published (#2436 moved it
// from VTBase to VTBase3); the point of the test below is that production does not draw a vector
// basemap and development does, not which cache it is.
const VECTOR_SERVICE = 'Hosted/VTBase3/VectorTileServer';

/** Every TypeScript source file in libs/ and apps/, specs excluded, relative to the repository root. */
function sources(): string[] {
  return ['libs', 'apps'].flatMap((root) =>
    (fs.readdirSync(path.join(REPO_ROOT, root), { recursive: true }) as string[])
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
      .map((file) => path.join(root, file))
  );
}

/** Only what this test reads of a basemap definition. */
interface Basemap {
  baseLayers: Array<{ url?: string }>;
}

const urlsOf = (basemap: Basemap) => basemap.baseLayers.map((layer) => layer.url ?? '');

describe('campus basemap', () => {
  it('resolves to the vector tiles on production and on dev (#2515)', () => {
    const resolve = (definitions as unknown as Record<string, unknown>)['aggiemapBasemap'] as
      ((isTesting: boolean) => Basemap) | undefined;

    expect(resolve).toBeInstanceOf(Function);
    // The expect above fails the test; this tells TypeScript what it established.
    if (!resolve) return;

    expect(urlsOf(resolve(false)).some((url) => url.includes(VECTOR_SERVICE))).toBe(true);
    expect(urlsOf(resolve(true)).some((url) => url.includes(VECTOR_SERVICE))).toBe(true);
  });

  it('offers production the vector basemap and the raster one, and development every published version (#1582, #2515)', () => {
    const gallery = (definitions as unknown as Record<string, unknown>)['aggiemapGalleryBasemaps'] as
      ((isTesting: boolean) => Array<Basemap & { id: string; title: string }>) | undefined;
    const resolve = (definitions as unknown as Record<string, (isTesting: boolean) => Basemap>)['aggiemapBasemap'];

    expect(gallery).toBeInstanceOf(Function);
    if (!gallery) return;

    // Production: the vector basemap first, which the map opens on, and the raster one it showed until #2515, so a
    // visitor who finds the new one harder to read has a way back, and a problem with it can be worked around without a
    // release. Nothing dated or development-only.
    const production = gallery(false);

    expect(production[0]).toEqual(resolve(false));
    expect(production.map((basemap) => basemap.title)).toEqual(['Aggieland', 'Aggieland raster']);
    expect(urlsOf(production[0]).some((url) => url.includes(VECTOR_SERVICE))).toBe(true);
    expect(urlsOf(production[1])).toEqual(urlsOf(definitions.AggiemapRasterBasemap as unknown as Basemap));
    expect(new Set(production.map((basemap) => basemap.id)).size).toBe(production.length);

    const dev = gallery(true);

    // The map opens on the first entry, so it must be the one the view was built with.
    expect(dev[0]).toEqual(resolve(true));
    expect(dev.map((basemap) => basemap.title)).toEqual([
      'Aggieland',
      'Aggieland vector, September 2026',
      'Aggieland raster, October 2026',
      'Aggieland raster, June 2026',
      'Aggieland raster, May 2026'
    ]);

    // The gallery marks the active basemap, and restores a saved one, by id.
    expect(new Set(dev.map((basemap) => basemap.id)).size).toBe(dev.length);

    // The raster basemap production shows is among them, so it can be seen drawn before a release. It
    // is found by title rather than by position, so adding a version above it cannot quietly point
    // this at something else (#2436 added the October vector cache at index 1).
    const productionRaster = dev.find((basemap) => basemap.title === 'Aggieland raster, October 2026');

    expect(productionRaster).toBeDefined();
    expect(urlsOf(productionRaster as Basemap)).toEqual(urlsOf(production[1]));

    // Both vector caches are offered, so the new one can be compared with the one it replaces.
    expect(urlsOf(dev[0]).some((url) => url.includes('Hosted/VTBase3/VectorTileServer'))).toBe(true);
    expect(urlsOf(dev[1]).some((url) => url.includes('Hosted/VTBase/VectorTileServer'))).toBe(true);
  });

  it('turns every id the gallery can save back into a basemap (#1726)', () => {
    const exported = definitions as unknown as Record<string, unknown>;
    const forSavedId = exported['basemapForSavedId'] as (id: string, isTesting: boolean) => Basemap | string;
    const gallery = exported['aggiemapGalleryBasemaps'] as (isTesting: boolean) => Array<Basemap & { id: string }>;
    const resolve = exported['aggiemapBasemap'] as (isTesting: boolean) => Basemap;

    // Each campus basemap development offers comes back as itself, never as a bare id: ArcGIS knows
    // none of these names, and a map handed one draws no basemap at all.
    for (const basemap of gallery(true)) {
      expect(forSavedId(basemap.id, true)).toEqual(basemap);
    }

    // A dated basemap saved on development and opened on production, which does not offer it.
    for (const basemap of gallery(true)) {
      expect(forSavedId(basemap.id, false)).toEqual(resolve(false));
    }

    // A campus id nobody offers any more.
    expect(forSavedId('aggie_basemap_raster_2024_01', true)).toEqual(resolve(true));

    // ArcGIS's own basemaps are named, not defined here.
    expect(forSavedId('topo-vector', true)).toBe('topo-vector');
    expect(forSavedId('streets-vector', false)).toBe('streets-vector');
  });

  it("gives a map that opens on the raster campus basemap the gallery's own October 2026 entry", () => {
    const exported = definitions as unknown as Record<string, unknown>;
    const raster = exported['aggiemapRasterBasemap'] as (isTesting: boolean) => Basemap & { id: string; title: string };
    const gallery = exported['aggiemapGalleryBasemaps'] as (isTesting: boolean) => Array<Basemap & { id: string }>;

    // On development it is the gallery's dated entry, so the panel marks it as the one showing.
    expect(raster(true).title).toBe('Aggieland raster, October 2026');
    expect(gallery(true)).toContainEqual(raster(true));

    // On production it is the gallery's raster entry, so the panel marks it there too (#2515).
    expect(gallery(false)).toContainEqual(raster(false));
    expect(urlsOf(raster(false))).toEqual(urlsOf(exported['AggiemapRasterBasemap'] as Basemap));
  });
  it('turns a saved Aerial Imagery choice back into the Nearmap basemap, on every environment (#1692)', () => {
    const exported = definitions as unknown as Record<string, unknown>;
    const forSavedId = exported['basemapForSavedId'] as (id: string, isTesting: boolean) => Basemap | string;
    const nearmap = exported['NearmapCSBasemap'] as Basemap & { id: string };

    // Handed over as its id, which ArcGIS does not know, it left an event map with no basemap and no
    // zoom levels: the map's layers a speck on a white page.
    expect(forSavedId(nearmap.id, true)).toEqual(nearmap);
    expect(forSavedId(nearmap.id, false)).toEqual(nearmap);
  });

  it('draws every basemap it defines from a picture shipped with the application (#1730)', () => {
    // A thumbnail named on a GIS service or a portal is fetched again on every map load, and the
    // panel fills in one row at a time. Each must be a file under libs/assets, which every build ships.
    const defined = Object.values(definitions as unknown as Record<string, unknown>).filter(
      (value): value is { thumbnailUrl: string } => typeof (value as { thumbnailUrl?: unknown })?.thumbnailUrl === 'string'
    );

    expect(defined.length).toBeGreaterThan(3);

    for (const basemap of defined) {
      expect(basemap.thumbnailUrl).toMatch(/^\/assets\/images\/basemap_thumbnails\/[a-z_]+\.png$/);
      expect(fs.existsSync(path.join(REPO_ROOT, 'libs', basemap.thumbnailUrl))).toBe(true);
    }
  });

  it('is used only by views that let the basemap decide the spatial reference', () => {
    // The vector tile cache is EPSG:32139 and Esri does not reproject vector tiles, so a view that
    // pins its own spatial reference loads the basemap correctly and draws nothing. #1227 removed the
    // pin from the main map; #1233 routed two more maps through the resolver and left theirs in, and
    // every event map and Ring Day went blank on dev (#1240).
    //
    // The suite cannot catch this - a map with no basemap still resolves all its layers - so the
    // invariant is asserted here instead: if you call the resolver, you do not pin the view.
    const offenders = sources()
      // The definition file is where the resolver lives, and the raster basemap declares its own
      // Web Mercator reference there, correctly.
      .filter((file) => path.normalize(file) !== DEFINITION)
      // Either way in: the resolver itself, or a saved choice turned back into a basemap (#1726).
      .filter((file) => /aggiemapBasemap\(|basemapForSavedId\(/.test(fs.readFileSync(path.join(REPO_ROOT, file), 'utf8')))
      .filter((file) => /spatialReference:\s*\{[^}]*wkid:\s*\d+/.test(fs.readFileSync(path.join(REPO_ROOT, file), 'utf8')));

    expect(offenders).toEqual([]);
  });

  it('is never named outside its definition, so every map resolves it by environment', () => {
    const offenders = sources()
      .filter((file) => path.normalize(file) !== DEFINITION)
      .filter((file) => {
        const text = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');

        return (
          text.includes(VECTOR_SERVICE) || /\b(AggiemapBasemap|AggiemapVectorBasemap|AggiemapRasterBasemap\w*)\b/.test(text)
        );
      });

    expect(offenders).toEqual([]);
  });
});

/**
 * The buildings under construction on the vector basemap (#2459). The tiles fill them with a sprite pattern that
 * was rasterized onto an opaque tile, so each draws as a solid pink block. The fill is hidden and the buildings are
 * drawn from the campus buildings service with an orange grid hatch and our own black outline over it. Replacing the
 * pattern in the sprite sheet instead blanked the map on about one load in four, and is gone.
 */
describe('the vector basemap draws its buildings under construction itself (#2459)', () => {
  const layers = (definitions.AggiemapVectorBasemap as unknown as {
    baseLayers: Array<Record<string, unknown>>;
  }).baseLayers;
  const tiles = layers.find((layer) => layer['type'] === 'VectorTileLayer');
  const construction = layers.find((layer) => layer['type'] === 'FeatureLayer');

  it("hides the tiles' construction fill and their outline, which a layer above the tiles cannot keep whole", () => {
    expect(tiles?.['hiddenStyleLayers']).toEqual([
      'Campus Structures/Currently Under Construction/1',
      'Campus Structures/Currently Under Construction/0'
    ]);
  });

  it('draws its own black outline on top of the hatch', () => {
    const symbolLayers = (
      construction?.['renderer'] as { symbol: { data: { symbol: { symbolLayers: Array<Record<string, unknown>> } } } }
    ).symbol.data.symbol.symbolLayers;

    // CIM draws the first symbol layer on top.
    expect(symbolLayers[0]).toMatchObject({ type: 'CIMSolidStroke', color: [0, 0, 0, 255] });
    expect(symbolLayers.slice(1).map((layer) => layer['type'])).toEqual(['CIMHatchFill', 'CIMHatchFill']);
  });

  it('draws the buildings under construction from the buildings service, with a CIM hatch', () => {
    expect(construction?.['url']).toMatch(/\/FCOR\/TAMU_Basemap_\d+\/MapServer\/2$/);
    expect(construction?.['definitionExpression']).toBe("Type = 'CONSTRUCTION'");
    expect(JSON.stringify(construction?.['renderer'])).toContain('CIMHatchFill');
  });

  it('patches no sprite sheet', () => {
    expect(JSON.stringify(layers)).not.toContain('spriteOverrides');
  });
});

/**
 * The vector basemap is production's default (#2515), so the smoke suite's list of services production must never request
 * cannot list it any more: that list fails the production run when a listed service is requested (#1229). The September
 * cache, still development-only, stays on it.
 */
describe('the smoke suite allows production the vector basemap (#2515)', () => {
  const developmentOnly = fs.readFileSync(path.join(REPO_ROOT, 'test', 'smoke', 'aggiemap', 'development-only.ts'), 'utf8');

  it('no longer lists the default vector basemap as development-only', () => {
    expect(developmentOnly).not.toContain(`'${VECTOR_SERVICE}'`);
  });

  it('still lists the September vector cache', () => {
    expect(developmentOnly).toContain("'Hosted/VTBase/VectorTileServer'");
  });
});
