import { StyleSpecification } from 'maplibre-gl';

import { TAMU_CAMPUS_BASEMAP_URL, TAMU_CAMPUS_VECTOR_BASEMAP_URL } from '@tamu-gisc/common/datasets/geographic';

import * as service from './mapbox-map.service';

/**
 * The GIS Day competition maps' basemap: the campus vector tiles, not the abandoned raster service.
 *
 * The maintainer abandoned the raster campus basemap's service on 9 November 2026. These maps drew its tiles because
 * the vector basemap was then in Texas State Plane and on development only; VTBase3 is in Web Mercator and public on
 * production, and publishes a MapLibre style. MapLibre resolves none of that style's relative paths, so the style is
 * given absolute ones as it loads.
 */
describe('the default MapLibre basemap', () => {
  const exported = service as unknown as Record<string, unknown>;
  const transform = exported['absoluteCampusStyle'] as
    ((previous: StyleSpecification | undefined, next: StyleSpecification) => StyleSpecification) | undefined;

  /** The parts of VTBase3's published style that matter here, as `resources/styles/root.json` gives them. */
  const published = (): StyleSpecification =>
    ({
      version: 8,
      sprite: '../sprites/sprite',
      glyphs: '../fonts/{fontstack}/{range}.pbf',
      sources: {
        esri: { type: 'vector', url: '../../', minzoom: 0, maxzoom: 22, bounds: [-96.6386, 30.3095, -96.0259, 31.0018] }
      },
      layers: [{ id: 'background', type: 'background' }]
    }) as unknown as StyleSpecification;

  it('is the campus vector tiles style, and reads nothing from the abandoned raster service', () => {
    expect(JSON.stringify(exported['DEFAULT_MAP_STYLE'])).not.toContain(TAMU_CAMPUS_BASEMAP_URL);
    expect(exported['DEFAULT_MAP_STYLE']).toBe(`${TAMU_CAMPUS_VECTOR_BASEMAP_URL}/resources/styles/root.json`);
  });

  it("makes the style's sprite and glyph paths absolute, keeping the glyph placeholders", () => {
    expect(transform).toBeInstanceOf(Function);

    const style = transform?.(undefined, published());

    expect(style?.sprite).toBe(`${TAMU_CAMPUS_VECTOR_BASEMAP_URL}/resources/sprites/sprite`);
    expect(style?.glyphs).toBe(`${TAMU_CAMPUS_VECTOR_BASEMAP_URL}/resources/fonts/{fontstack}/{range}.pbf`);
  });

  it("gives the vector source the service's tiles, keeping its zoom range and bounds", () => {
    const source = transform?.(undefined, published()).sources['esri'] as Record<string, unknown> | undefined;

    // `../../` is the service's own page, which answers HTML, not TileJSON.
    expect(source?.['url']).toBeUndefined();
    expect(source?.['tiles']).toEqual([`${TAMU_CAMPUS_VECTOR_BASEMAP_URL}/tile/{z}/{y}/{x}.pbf`]);
    expect(source).toMatchObject({
      type: 'vector',
      minzoom: 0,
      maxzoom: 22,
      bounds: [-96.6386, 30.3095, -96.0259, 31.0018]
    });
  });

  it('credits the university, as the raster tiles did, since the published source credits no one', () => {
    const source = transform?.(undefined, published()).sources['esri'] as Record<string, unknown> | undefined;

    expect(source?.['attribution']).toBe('Texas A&amp;M University');
  });

  it('leaves an absolute path, and every layer, as they are', () => {
    const style = { ...published(), sprite: 'https://example.com/sprite' } as StyleSpecification;
    const transformed = transform?.(undefined, style);

    expect(transformed?.sprite).toBe('https://example.com/sprite');
    expect(transformed?.layers).toEqual(style.layers);
  });
});
