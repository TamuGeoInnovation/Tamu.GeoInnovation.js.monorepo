import * as fs from 'fs';
import * as path from 'path';

import * as definitions from './basemaps.definition';

/**
 * The vector tile campus basemap stays off production until it is published there (#1229).
 *
 * `Hosted/VTBase/VectorTileServer` has no production service. A service without one must never be
 * visible on production unless that is explicitly allowed - the rule that keeps bus routes off
 * production - and #1227 put this one on every environment.
 *
 * - **The resolver.** `aggiemapBasemap(isTesting)` gives dev the vector tiles and production the raster
 *   basemap.
 * - **Nothing goes around it.** Outside the definition file, no code may name the vector tile service
 *   or either fixed campus basemap. A map that imported one directly would show it on every
 *   environment, as the main map, the gallery and both event maps did.
 *
 * When the vector tiles are published for production, make `aggiemapBasemap` return them everywhere
 * and change this test with it.
 */

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const DEFINITION = path.join('libs', 'maps', 'feature', 'basemap', 'src', 'lib', 'shared', 'basemaps.definition.ts');
const VECTOR_SERVICE = 'Hosted/VTBase/VectorTileServer';

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
  it('resolves to the raster basemap on production and the vector tiles on dev', () => {
    const resolve = (definitions as unknown as Record<string, unknown>)['aggiemapBasemap'] as
      ((isTesting: boolean) => Basemap) | undefined;

    expect(resolve).toBeInstanceOf(Function);
    // The expect above fails the test; this tells TypeScript what it established.
    if (!resolve) return;

    expect(urlsOf(resolve(false)).some((url) => url.includes(VECTOR_SERVICE))).toBe(false);
    expect(urlsOf(resolve(true)).some((url) => url.includes(VECTOR_SERVICE))).toBe(true);
  });

  it('offers production one campus basemap, and development every published version (#1582)', () => {
    const gallery = (definitions as unknown as Record<string, unknown>)['aggiemapGalleryBasemaps'] as
      ((isTesting: boolean) => Array<Basemap & { id: string; title: string }>) | undefined;
    const resolve = (definitions as unknown as Record<string, (isTesting: boolean) => Basemap>)['aggiemapBasemap'];

    expect(gallery).toBeInstanceOf(Function);
    if (!gallery) return;

    // Production: the one basemap it has always had, and nothing dated or development-only.
    expect(gallery(false)).toEqual([resolve(false)]);
    expect(gallery(false).map((basemap) => basemap.title)).toEqual(['Aggieland']);

    const dev = gallery(true);

    // The map opens on the first entry, so it must be the one the view was built with.
    expect(dev[0]).toEqual(resolve(true));
    expect(dev.map((basemap) => basemap.title)).toEqual([
      'Aggieland vector, September 2026',
      'Aggieland raster, October 2026',
      'Aggieland raster, June 2026',
      'Aggieland raster, May 2026'
    ]);

    // The gallery marks the active basemap, and restores a saved one, by id.
    expect(new Set(dev.map((basemap) => basemap.id)).size).toBe(dev.length);

    // The raster basemap production shows is among them, so it can be seen drawn before a release.
    expect(urlsOf(dev[1])).toEqual(urlsOf(resolve(false)));
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

    // Production has one campus basemap, and it is this raster one.
    expect(raster(false)).toEqual(exported['AggiemapRasterBasemap']);
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
