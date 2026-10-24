import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Map, MapOptions, setWorkerUrl } from 'maplibre-gl';

/**
 * The basemap when a caller gives no style: OpenFreeMap's "positron", a light grey vector style from OpenStreetMap
 * data that needs no account, key or token. It replaced Mapbox's hosted `light-v10` when this library moved from
 * mapbox-gl 1 to maplibre-gl (#1218): Mapbox 2 and later are not open source, and their hosted styles need Mapbox's
 * own terms and a token.
 */
export const DEFAULT_MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

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
