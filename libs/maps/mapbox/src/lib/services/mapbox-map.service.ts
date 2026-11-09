import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Map, MapOptions, StyleSpecification, setWorkerUrl } from 'maplibre-gl';

import { TAMU_CAMPUS_VECTOR_BASEMAP_URL } from '@tamu-gisc/common/datasets/geographic';

/**
 * The basemap when a caller gives no style: the university's own campus basemap, the one AggieMap opens on, as the
 * MapLibre style its vector tile service publishes (no key or token). It replaced Mapbox's hosted `light-v10` when this
 * library moved from mapbox-gl 1 to maplibre-gl (#1218): Mapbox 2 and later are not open source, and their hosted
 * styles need Mapbox's own terms and a token. It was the campus raster tiles until their service was abandoned on
 * 9 November 2026. Drawn with `absoluteCampusStyle`, which the published style needs.
 */
export const DEFAULT_MAP_STYLE = `${TAMU_CAMPUS_VECTOR_BASEMAP_URL}/resources/styles/root.json`;

/** `relative` resolved against the campus style's own address, with MapLibre's `{placeholders}` left as they are. */
function fromCampusStyle(relative: string): string {
  return new URL(relative, DEFAULT_MAP_STYLE).href.replace(/%7B/gi, '{').replace(/%7D/gi, '}');
}

/**
 * The campus style as MapLibre can draw it, given to the map as its `transformStyle`.
 *
 * The published style names its sprite, glyphs and tiles relative to itself, as ArcGIS's own clients read them, and
 * MapLibre resolves none of them: it refuses a relative sprite outright, and takes the source's `../../` relative to
 * the page. That is the service's own page in any case, which answers HTML rather than TileJSON. So the sprite and
 * glyphs are made absolute, and the vector source is given the service's tiles in place of its `url`, keeping its zoom
 * range and bounds. Measured with maplibre-gl 6.16 on 9 November 2026: as published, no tile was asked for; this way the
 * style, its tiles, sprite and glyphs all answered 200 and the map drew all 115 layers.
 *
 * The published source credits no one, so it is credited as the raster tiles were, to the university.
 */
export function absoluteCampusStyle(
  _previous: StyleSpecification | undefined,
  next: StyleSpecification
): StyleSpecification {
  return {
    ...next,
    sprite: typeof next.sprite === 'string' ? fromCampusStyle(next.sprite) : next.sprite,
    glyphs: next.glyphs === undefined ? undefined : fromCampusStyle(next.glyphs),
    sources: Object.fromEntries(
      Object.entries(next.sources).map(([id, source]) => {
        if (source.type !== 'vector' || source.url === undefined) {
          return [id, source];
        }

        const { url, ...rest } = source;

        return [
          id,
          {
            attribution: 'Texas A&amp;M University',
            ...rest,
            tiles: [`${TAMU_CAMPUS_VECTOR_BASEMAP_URL}/tile/{z}/{y}/{x}.pbf`]
          }
        ];
      })
    )
  };
}

/**
 * Where an app serves maplibre-gl's worker, relative to its base href. Each app that uses this library copies it
 * there as an asset (`node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs`, output `maplibre`): maplibre-gl looks for
 * it beside its own module file, which is not where it ends up once bundled.
 */
export const MAPLIBRE_WORKER_ASSET = 'maplibre/maplibre-gl-worker.mjs';

let workerReady: Promise<void> | undefined;

/**
 * Points maplibre-gl at the app's copy of its worker, once. The script is fetched and handed over as a blob typed as
 * JavaScript, so it loads as a module worker whatever content type the web server gives `.mjs` (nginx-base gives
 * none, and a module worker refuses that).
 */
function useAppWorker(): Promise<void> {
  workerReady ??= fetch(new URL(MAPLIBRE_WORKER_ASSET, document.baseURI))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`maplibre-gl's worker is not at ${MAPLIBRE_WORKER_ASSET} (${response.status}).`);
      }

      return response.text();
    })
    .then((code) => setWorkerUrl(URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))));

  return workerReady;
}

@Injectable({
  providedIn: 'root'
})
export class MapboxMapService {
  public map: Map;

  public loaded: ReplaySubject<Map> = new ReplaySubject(1);

  public async createMap(properties?: MapOptions) {
    await useAppWorker();

    const defaultsUnlessProvided: Partial<MapOptions> = {
      ...properties,
      style: properties.style ? properties.style : DEFAULT_MAP_STYLE,
      ...(properties.style ? {} : { transformStyle: absoluteCampusStyle }),
      center: properties.center ? properties.center : [0, 0],
      minZoom: properties.minZoom ? properties.minZoom : 3,
      maxZoom: properties.maxZoom ? properties.maxZoom : 10
    };

    this.map = new Map(defaultsUnlessProvided as MapOptions);

    this.map.on('load', () => {
      this.loaded.next(this.map);
    });
  }
}
