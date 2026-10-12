import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, firstValueFrom, from, map, switchMap } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { aggiemapBasemap, NearmapCSBasemap } from '../../shared/basemaps.definition';

import esri = __esri;

/**
 * One Nearmap capture of the area the map is looking at: the date it was flown, and the WMS sublayer
 * that draws it.
 */
export interface NearmapCapture {
  /** `YYYY-MM-DD`, as Nearmap names it. Also the value of the `imagery` URL parameter. */
  date: string;
  /** The date for people, `Nov 22, 2025`. */
  label: string;
  /** The WMS sublayer name, `area/<area>/survey/<survey>/<date>`. */
  name: string;
}

/**
 * The URL parameter that opens the Aerial Imagery basemap on a chosen capture: `?imagery=2025-11-22`.
 */
export const NEARMAP_IMAGERY_PARAM = 'imagery';

/** Nearmap names each capture's WMS sublayer `area/<area>/survey/<survey>/<date>`. */
const NEARMAP_SURVEY_NAME = /\/survey\/[^/]+\/(\d{4}-\d{2}-\d{2})$/;

@Injectable({
  providedIn: 'root'
})
export class BasemapGalleryService {
  private readonly mp = inject(EsriModuleProviderService);
  private readonly ms = inject(EsriMapService);
  private readonly ts = inject(TestingService);
  private readonly router = inject(Router);

  /**
   * Which sublayers each Nearmap layer showed when it loaded, so "Latest" can put them back.
   *
   * By default the layer draws Nearmap's combined mosaic, which is the newest capture of every spot.
   */
  private readonly nearmapDefaults = new WeakMap<esri.WMSLayer, Map<esri.WMSSublayer, boolean>>();

  /**
   * The layers turned off when an older capture was chosen, to turn back on at the latest again. Set
   * only while an older capture is showing.
   */
  private hiddenForCapture: { layers: esri.Layer[]; added: { remove(): void } } | undefined;

  /**
   * The Nearmap captures of the spot the map is on, newest first. Empty unless Aerial Imagery is showing
   * and its date can be chosen here.
   */
  public readonly nearmapCaptures = signal<NearmapCapture[]>([]);

  /** The capture showing, or undefined for Nearmap's latest. */
  public readonly nearmapDate = signal<string | undefined>(undefined);

  /** True while a capture is being switched to and drawn. */
  public readonly nearmapLoading = signal(false);

  constructor() {
    let watch: { remove(): void } | undefined;

    this.ms.store.subscribe((instance) => {
      watch?.remove();
      watch = instance.map.watch('basemap', () => this.onBasemapChange(instance));
      this.onBasemapChange(instance);
    });
  }

  public gallery() {
    return combineLatest([
      this.mp.require([
        'BaseMapGalleryViewModel',
        'LocalBasemapsSource',
        'Basemap',
        'TileLayer',
        'VectorTileLayer',
        'WMSLayer',
        'projection'
      ]),
      this.ms.store
    ]).pipe(
      switchMap(
        ([
          [BasemapGalleryViewModel, LocalBasemapsSource, Basemap, TileLayer, VectorTileLayer, WMSLayer, projection],
          instances
        ]: [
          [
            esri.BasemapGalleryViewModelConstructor,
            esri.LocalBasemapsSourceConstructor,
            esri.BasemapConstructor,
            esri.TileLayerConstructor,
            esri.VectorTileLayerConstructor,
            esri.WMSLayerConstructor,
            esri.projection
          ],
          MapServiceInstance
        ]) => {
          // On dev the Aggieland basemap is published in EPSG:32139 and the rest of the gallery is in Web Mercator.
          // Switching between them changes the view's spatial reference, which the API supports from 4.23 -
          // but only with the projection engine loaded. Without it the view's center does not survive the
          // switch. Loading it before the gallery exists means the first switch is already safe.
          return from(projection.load()).pipe(
            map(() => {
              // There is a bug in the current version of the JS API (4.23) that prevents Aggiemap basemap from loading
              // from an auto-castable source because the baseLayers are not an instance of a class and the load() method does not exist.
              // To work around this, we need ton construct a new instance of the layer class and pass in the base

              // Vector tiles on dev, raster on production, until the vector tiles are published there (#1229).
              const campusBasemap = aggiemapBasemap(this.ts.isTesting);

              // Clone the base layer JSON object
              const baseLayerJSON = JSON.parse(JSON.stringify(campusBasemap.baseLayers[0]));
              const baseLayerType = baseLayerJSON.type;

              // Remove the type property to prevent read-only property assignment error.
              delete baseLayerJSON.type;

              const baseLayers =
                baseLayerType === 'VectorTileLayer'
                  ? new VectorTileLayer({ ...baseLayerJSON })
                  : new TileLayer({ ...baseLayerJSON });

              const instancedAggiemapBasemap = new Basemap({ ...campusBasemap, baseLayers: [baseLayers] });
              const nearmapCSBasemap = this.makeNearmapBasemap(Basemap, WMSLayer);

              const model = new BasemapGalleryViewModel({
                view: instances.view,
                source: new LocalBasemapsSource({
                  basemaps: [
                    instancedAggiemapBasemap,
                    Basemap.fromId('topo-vector'),
                    Basemap.fromId('streets-relief-vector'),
                    Basemap.fromId('streets-navigation-vector'),
                    Basemap.fromId('streets-vector'),
                    Basemap.fromId('gray-vector'),
                    nearmapCSBasemap
                  ]
                })
              });

              return model;
            })
          );
        }
      )
    );
  }

  /**
   * Applies a basemap, moving the view to that basemap's spatial reference when they differ.
   *
   * The gallery mixes projections: the campus basemap is a vector tile cache in EPSG:32139 while the
   * Esri basemaps and Nearmap are Web Mercator. From 4.23 a view can change its spatial reference at
   * runtime, but only when the basemap is changed *through the BasemapGallery or BasemapToggle
   * widget*. This sets `map.basemap` directly, which does not carry the view with it - the basemap
   * swaps, the view stays put, and the new basemap silently draws nothing.
   *
   * So the view is moved explicitly. `projection` is loaded in `gallery()` above, without which the
   * view's center does not survive the change.
   */
  public async setBasemap(basemap: esri.Basemap): Promise<void> {
    const instance = await firstValueFrom(this.ms.store);

    await basemap.load();

    const baseLayer = basemap.baseLayers.getItemAt(0);

    if (baseLayer && 'load' in baseLayer) {
      await baseLayer.load();
    }

    instance.map.basemap = basemap;

    const target = baseLayer && (baseLayer as unknown as { spatialReference?: esri.SpatialReference }).spatialReference;
    const current = instance.view.spatialReference;

    if (target && current && !target.equals(current)) {
      instance.view.spatialReference = target;
    }

    await this.whenViewIdle(instance.view);
  }

  /**
   * Whether a visitor may choose the Aerial Imagery capture date.
   *
   * Development only (#1541): older captures may be billed differently from the current one, and that
   * is to be known before the control reaches production.
   */
  public get canChooseNearmapDate(): boolean {
    return this.ts.isTesting;
  }

  /**
   * Opens the Aerial Imagery basemap on the capture named by `?imagery=`, for a link copied from a map
   * showing one. Call once the map is created. Does nothing where the date cannot be chosen.
   */
  public async applyNearmapCaptureFromUrl(): Promise<void> {
    const date = new URLSearchParams(window.location.search).get(NEARMAP_IMAGERY_PARAM) ?? undefined;

    if (!date || !this.canChooseNearmapDate) {
      return;
    }

    const [Basemap, WMSLayer] = (await this.mp.require(['Basemap', 'WMSLayer'])) as [
      esri.BasemapConstructor,
      esri.WMSLayerConstructor
    ];

    await this.loadProjection();

    await this.setBasemap(this.makeNearmapBasemap(Basemap, WMSLayer));
    await this.setNearmapCapture(date);
  }

  /**
   * Shows one Nearmap capture on the Aerial Imagery basemap, or with no date, Nearmap's latest mosaic
   * again. Records the choice in the URL as `?imagery=`, so a copied link opens on the same capture.
   *
   * A date with no capture falls back to the latest. `nearmapDate` says which is showing.
   */
  public async setNearmapCapture(date: string | undefined): Promise<void> {
    const instance = await firstValueFrom(this.ms.store);
    const layer = this.nearmapLayer(instance);

    if (!layer) {
      return;
    }

    this.nearmapLoading.set(true);

    try {
      await layer.load();

      const defaults = this.nearmapDefaults.get(layer) ?? new Map<esri.WMSSublayer, boolean>();

      if (!this.nearmapDefaults.has(layer)) {
        layer.allSublayers.forEach((sublayer) => defaults.set(sublayer, sublayer.visible));
        this.nearmapDefaults.set(layer, defaults);
      }

      const capture = date ? (await this.readNearmapCaptures(instance)).find((c) => c.date === date) : undefined;
      const target = capture ? layer.allSublayers.find((sublayer) => sublayer.name === capture.name) : undefined;

      if (target) {
        // Only the chosen capture and the groups it sits in, so the service draws that one survey.
        const keep = new Set<esri.WMSSublayer>();

        for (let s: esri.WMSSublayer = target; s; s = s.parent as esri.WMSSublayer) {
          keep.add(s);
        }

        layer.allSublayers.forEach((sublayer) => (sublayer.visible = keep.has(sublayer)));
        this.hideLayersForCapture(instance.map);
      } else {
        defaults.forEach((visible, sublayer) => (sublayer.visible = visible));
        this.restoreLayersHiddenForCapture();
      }

      this.nearmapDate.set(target ? capture.date : undefined);
      this.setImageryParam(this.nearmapDate());

      await this.whenViewIdle(instance.view);
    } finally {
      this.nearmapLoading.set(false);
    }
  }

  /**
   * Keeps the capture state in step with the basemap, however it was changed: the Basemap panel, an
   * `?imagery=` link, or a choice saved from an earlier visit.
   *
   * Any basemap starts on its latest imagery, Aerial Imagery chosen again included. So a change of
   * basemap turns back on the layers an older capture hid, and takes the date out of the URL.
   */
  private async onBasemapChange(instance: MapServiceInstance): Promise<void> {
    this.restoreLayersHiddenForCapture();

    if (this.nearmapDate()) {
      this.nearmapDate.set(undefined);
      this.setImageryParam(undefined);
    }

    const captures = this.canChooseNearmapDate ? await this.readNearmapCaptures(instance) : [];

    // Another basemap may have been chosen while these were read.
    if (instance.map.basemap?.id === NearmapCSBasemap.id || captures.length === 0) {
      this.nearmapCaptures.set(captures);
    }
  }

  /**
   * The Nearmap captures covering the centre of the map, newest first, or an empty list when the map
   * is not showing Aerial Imagery.
   *
   * Read from the WMS service's own capabilities, which list one sublayer per capture, so the list is
   * what Nearmap actually has rather than a calendar of empty months. Captures of neighbouring towns
   * share the service and are left out by their extent.
   */
  private async readNearmapCaptures(instance: MapServiceInstance): Promise<NearmapCapture[]> {
    const layer = this.nearmapLayer(instance);

    if (!layer) {
      return [];
    }

    await layer.load();

    const projection = await this.loadProjection();

    const center = instance.view.center;
    const byDate = new Map<string, NearmapCapture>();

    layer.allSublayers.forEach((sublayer) => {
      const date = NEARMAP_SURVEY_NAME.exec(sublayer.name ?? '')?.[1];
      const extent = sublayer.fullExtent;

      if (!date || byDate.has(date)) {
        return;
      }

      const point = extent && projection.project(center, extent.spatialReference);

      if (extent && point && !extent.contains(point as esri.Point)) {
        return;
      }

      // Noon, so no time zone can move a bare date onto the day before.
      const label = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      byDate.set(date, { date, label, name: sublayer.name });
    });

    return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
  }
  /**
   * Turns off every layer a visitor could turn on, so an older capture is seen as it was rather than
   * under today's buildings and zones. Remembers which were on, to restore at the latest again.
   *
   * Only on the move from the latest: going from one older date to another leaves alone whatever the
   * visitor has since turned back on. Layers kept out of the Layers list (`listMode: 'hide'`), such as
   * the selection highlight, are not touched, since nobody could turn them back on. A layer added while
   * an older capture shows - a map opened from an `?imagery=` link is still adding them - starts off too.
   */
  private hideLayersForCapture(map: esri.Map): void {
    if (this.hiddenForCapture) {
      return;
    }

    const layers: esri.Layer[] = [];
    const hide = (layer: esri.Layer) => {
      if (layer.visible && layer.listMode !== 'hide') {
        layer.visible = false;
        layers.push(layer);
      }
    };

    map.layers.forEach(hide);

    const added = map.layers.on('after-add', (event: { item: esri.Layer }) => hide(event.item));

    this.hiddenForCapture = { layers, added };
  }

  private restoreLayersHiddenForCapture(): void {
    if (!this.hiddenForCapture) {
      return;
    }

    this.hiddenForCapture.added.remove();
    this.hiddenForCapture.layers.forEach((layer) => (layer.visible = true));
    this.hiddenForCapture = undefined;
  }

  private setImageryParam(date: string | undefined): void {
    const current = new URLSearchParams(window.location.search).get(NEARMAP_IMAGERY_PARAM) ?? undefined;

    if (current === date) {
      return;
    }

    this.router.navigate([], {
      queryParams: { [NEARMAP_IMAGERY_PARAM]: date ?? null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private makeNearmapBasemap(Basemap: esri.BasemapConstructor, WMSLayer: esri.WMSLayerConstructor): esri.Basemap {
    const nearmapJSON = JSON.parse(JSON.stringify(NearmapCSBasemap.baseLayers[0]));

    // Remove the type property to prevent read-only property assignment error.
    delete nearmapJSON.type;

    return new Basemap({ ...NearmapCSBasemap, baseLayers: [new WMSLayer({ ...nearmapJSON })] });
  }

  /** The projection engine, loaded: `setBasemap` needs it to move the view between references. */
  private async loadProjection(): Promise<esri.projection> {
    const [projection] = (await this.mp.require(['projection'])) as [esri.projection];

    await projection.load();

    return projection;
  }

  /** The Aerial Imagery layer, when that is the basemap the map is showing. */
  private nearmapLayer(instance: MapServiceInstance): esri.WMSLayer | undefined {
    const basemap = instance?.map?.basemap;

    if (basemap?.id !== NearmapCSBasemap.id) {
      return undefined;
    }

    const layer = basemap.baseLayers.getItemAt(0);

    return layer?.type === 'wms' ? (layer as esri.WMSLayer) : undefined;
  }

  /**
   * Resolves once the view has finished redrawing.
   *
   * `map.basemap = ...` returns immediately; the tiles arrive afterwards. Callers showing a loading
   * state need the later moment, which is what makes the Aerial Imagery wait visible rather than
   * looking like nothing happened.
   */
  private whenViewIdle(view: esri.MapView | esri.SceneView): Promise<void> {
    if (!view.updating) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const handle = view.watch('updating', (updating: boolean) => {
        if (!updating) {
          handle.remove();
          resolve();
        }
      });
    });
  }
}
