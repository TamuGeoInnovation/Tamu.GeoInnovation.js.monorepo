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
      | ((isTesting: boolean) => Basemap)
      | undefined;

    expect(resolve).toBeInstanceOf(Function);

    expect(urlsOf(resolve(false)).some((url) => url.includes(VECTOR_SERVICE))).toBe(false);
    expect(urlsOf(resolve(true)).some((url) => url.includes(VECTOR_SERVICE))).toBe(true);
  });

  it('is never named outside its definition, so every map resolves it by environment', () => {
    const offenders = sources()
      .filter((file) => path.normalize(file) !== DEFINITION)
      .filter((file) => {
        const text = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');

        return (
          text.includes(VECTOR_SERVICE) || /\b(AggiemapBasemap|AggiemapVectorBasemap|AggiemapRasterBasemap)\b/.test(text)
        );
      });

    expect(offenders).toEqual([]);
  });
});
