import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, firstValueFrom, from, map, switchMap } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { aggiemapGalleryBasemaps, aggiemapRasterBasemap, NearmapCSBasemap } from '../../shared/basemaps.definition';

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

/**
 * What a Nearmap WMS service offers: its latest imagery, and each capture.
 *
 * Nearmap groups an area's captures under one named layer, `area/<area>/all/all-combined`, which draws
 * the newest capture of every spot. The layer is asked for that group by its one name (#1997).
 */
export interface NearmapService {
  /** The group's name, which draws the latest imagery. */
  latest: string;

  /** Each capture's sublayer name and extent, as the capabilities list them. */
  captures: Array<{ name: string; fullExtent: esri.Extent | null | undefined }>;
}

/**
 * Reads a loaded Nearmap layer's capabilities: the group that draws its latest imagery, and the captures
 * in it. `undefined` for a service with no captures, which is then left to draw as ArcGIS chooses.
 */
export function readNearmapService(layer: Pick<esri.WMSLayer, 'allSublayers'>): NearmapService | undefined {
  const captures = layer.allSublayers.filter((sublayer) => NEARMAP_SURVEY_NAME.test(sublayer.name ?? '')).toArray();
  const latest = (captures[0]?.parent as esri.WMSSublayer | undefined)?.name;

  if (!latest) {
    return undefined;
  }

  return { latest, captures: captures.map((sublayer) => ({ name: sublayer.name, fullExtent: sublayer.fullExtent })) };
}

/**
 * Has a Nearmap layer draw one named layer of its service: the latest imagery or one capture.
 *
 * ArcGIS names every visible leaf sublayer in a GetMap. Left to itself the layer named all 19 campus
 * captures, which took the request past `esriConfig.request.maxUrlLength` and so made it a POST, and
 * Nearmap answers a POST with an empty document on some requests: Aerial Imagery opened blank (#1997).
 * One name is a short GET. Replacing `sublayers` after load is how ArcGIS documents drawing a subset.
 */
export function drawNearmapLayer(layer: esri.WMSLayer, name: string): void {
  if (layer.sublayers.length === 1 && layer.sublayers.getItemAt(0)?.name === name) {
    return;
  }

  // ArcGIS turns plain sublayer properties into a WMSSublayer collection; the typings see only the getter.
  layer.sublayers = [{ name, visible: true }] as unknown as esri.Collection<esri.WMSSublayer>;
}

@Injectable({
  providedIn: 'root'
})
export class BasemapGalleryService {
  private readonly mp = inject(EsriModuleProviderService);
  private readonly ms = inject(EsriMapService);
  private readonly ts = inject(TestingService);
  private readonly router = inject(Router);

  /**
   * The basemap to show when the map is next in 2D: one put aside because a scene could not draw it,
   * or chosen in the basemap panel while in 3D (#1735). `undefined` when 2D shows what 3D showed.
   */
  private basemapAfterScene: esri.Basemap | undefined;

  /** Whether the map is showing a 3D scene now. */
  private readonly inScene = signal(false);

  /** The ids of the basemaps the panel offers that a 3D scene cannot draw, found as each one loads. */
  private readonly notForScenes = signal<ReadonlySet<string>>(new Set());

  /** What each Nearmap layer's service offers, read once from its capabilities (see `nearmapService`). */
  private readonly nearmapServices = new WeakMap<esri.WMSLayer, NearmapService>();

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

    this.ms.store.subscribe(async (instance) => {
      const [reactiveUtils] = (await this.mp.require(['reactiveUtils'])) as [esri.reactiveUtils];

      watch?.remove();
      watch = reactiveUtils.watch(() => instance.map.basemap, () => this.onBasemapChange(instance), { initial: true });
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
        'projectOperator'
      ]),
      this.ms.store
    ]).pipe(
      switchMap(
        ([
          [BasemapGalleryViewModel, LocalBasemapsSource, Basemap, TileLayer, VectorTileLayer, WMSLayer, projectOperator],
          instances
        ]: [
          [
            typeof esri.BasemapGalleryViewModel,
            typeof esri.LocalBasemapsSource,
            typeof esri.Basemap,
            typeof esri.TileLayer,
            typeof esri.VectorTileLayer,
            typeof esri.WMSLayer,
            esri.projectOperator
          ],
          MapServiceInstance
        ]) => {
          this.inScene.set(instances.view?.type === '3d');

          // On dev the Aggieland basemap is published in EPSG:32139 and the rest of the gallery is in Web Mercator.
          // Switching between them changes the view's spatial reference, which the API supports from 4.23 -
          // but only with the projection engine loaded. Without it the view's center does not survive the
          // switch. Loading it before the gallery exists means the first switch is already safe.
          return from(projectOperator.load()).pipe(
            map(() => {
              // There is a bug in the current version of the JS API (4.23) that prevents Aggiemap basemap from loading
              // from an auto-castable source because the baseLayers are not an instance of a class and the load() method does not exist.
              // To work around this, we need ton construct a new instance of the layer class and pass in the base

              // Vector tiles on dev, raster on production, until the vector tiles are published there (#1229).
              // Dev also offers every published raster version, to compare them (#1582).
              const campusBasemaps = aggiemapGalleryBasemaps(this.ts.isTesting).map((campusBasemap) => {
                // Clone the base layer JSON object, without its type: assigning it is a read-only property error.
                const { type, ...baseLayerJSON } = JSON.parse(JSON.stringify(campusBasemap.baseLayers[0]));

                const baseLayer =
                  type === 'VectorTileLayer' ? new VectorTileLayer({ ...baseLayerJSON }) : new TileLayer({ ...baseLayerJSON });

                return new Basemap({ ...campusBasemap, baseLayers: [baseLayer] });
              });

              // Which of them a 3D scene cannot draw is known only once each has read its service.
              for (const basemap of campusBasemaps) {
                const baseLayer = basemap.baseLayers.getItemAt(0);

                baseLayer
                  ?.load()
                  .then(() => {
                    if (!drawsInAScene((baseLayer as unknown as { spatialReference?: esri.SpatialReference }).spatialReference)) {
                      this.notForScenes.update((ids) => new Set([...ids, basemap.id]));
                    }
                  })
                  .catch(() => undefined);
              }

              const nearmapCSBasemap = this.makeNearmapBasemap(Basemap, WMSLayer);

              const model = new BasemapGalleryViewModel({
                view: instances.view,
                source: new LocalBasemapsSource({
                  basemaps: [
                    ...campusBasemaps,
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
   * So the view is moved explicitly. `projectOperator` is loaded in `gallery()` above, without which the
   * view's center does not survive the change.
   */
  public async setBasemap(basemap: esri.Basemap): Promise<void> {
    const instance = await firstValueFrom(this.ms.store);

    await basemap.load();

    const baseLayer = basemap.baseLayers.getItemAt(0);

    if (baseLayer && 'load' in baseLayer) {
      await baseLayer.load();
    }

    const target = baseLayer && (baseLayer as unknown as { spatialReference?: esri.SpatialReference }).spatialReference;

    // A 3D scene is a globe and stays in Web Mercator. Moving it to another reference, as a 2D view
    // is moved below, leaves a scene of bands with no map in it (#1735). So in 3D the reference is
    // never touched, and a basemap the scene cannot draw - the campus vector tiles, in EPSG:32139 -
    // is kept for when the map goes back to 2D.
    if (instance.view.type === '3d') {
      if (drawsInAScene(target)) {
        this.basemapAfterScene = undefined;
        instance.map.basemap = basemap;
      }

      // Otherwise nothing: the basemap panel shows such a basemap as unavailable while the map is in
      // 3D and does not offer it (#1740), so this is reached only by something that did not ask first.
      return;
    }

    instance.map.basemap = basemap;

    const current = instance.view.spatialReference;

    if (target && current && !target.equals(current)) {
      instance.view.spatialReference = target;
    }

    await this.whenBasemapDrawn(instance.view);
  }

  /**
   * Gets the map ready to be shown in 3D (#1735). Call before the scene takes the map.
   *
   * On development the campus basemap is a vector tile cache in EPSG:32139. A scene given that map
   * comes up in that reference and not as a globe, and the 3D buildings cannot be drawn in it: 3D
   * tilted, with every building flat. So a basemap a scene cannot draw is put aside and the raster
   * campus basemap, which every environment has in Web Mercator, stands in until the map is 2D again.
   */
  public async prepareForScene(): Promise<void> {
    const instance = await firstValueFrom(this.ms.store);
    const basemap = instance.map.basemap;
    const baseLayer = basemap?.baseLayers.getItemAt(0);

    if (baseLayer && 'load' in baseLayer) {
      await baseLayer.load().catch(() => undefined);
    }

    const reference =
      (baseLayer as unknown as { spatialReference?: esri.SpatialReference } | undefined)?.spatialReference ??
      instance.view.spatialReference;

    if (drawsInAScene(reference)) {
      return;
    }

    this.basemapAfterScene = basemap;
    instance.map.basemap = await this.standIn();
  }

  /**
   * The basemap a scene shows in place of one it cannot draw: the raster campus basemap, which every
   * environment has in Web Mercator. Taken from the list the panel is built from, under its own id,
   * so the panel marks it as the basemap on screen, which it is: the first campus basemap offered
   * here that is not vector tiles, or the raster one where none is.
   */
  private async standIn(): Promise<esri.Basemap> {
    const [Basemap, TileLayer] = (await this.mp.require(['Basemap', 'TileLayer'])) as [
      typeof esri.Basemap,
      typeof esri.TileLayer
    ];
    const raster =
      aggiemapGalleryBasemaps(this.ts.isTesting).find((basemap) => basemap.baseLayers[0].type !== 'VectorTileLayer') ??
      aggiemapRasterBasemap(this.ts.isTesting);
    const { type, ...layer } = JSON.parse(JSON.stringify(raster.baseLayers[0]));

    return new Basemap({ ...raster, baseLayers: [new TileLayer({ ...layer })] });
  }

  /**
   * Whether the basemap panel should show a basemap as unavailable: the map is in 3D, and this is a
   * basemap a scene cannot draw (#1740).
   *
   * Before this, choosing the campus vector tiles in 3D did nothing a visitor could see - the scene
   * cannot draw them, so the choice was kept for 2D - and the basemap simply looked broken. It is
   * now said outright, and stops applying when the vector tiles are published in Web Mercator.
   */
  public unavailable(basemap: esri.Basemap): boolean {
    return this.inScene() && this.notForScenes().has(basemap.id);
  }

  /**
   * The basemap a 2D view should show when the map comes back from 3D, and the spatial reference the
   * view must be in to show it (#1735). Call before the 2D view takes the map.
   *
   * That is the basemap put aside for the scene, or one chosen while in it, or simply the one the
   * scene was showing. The caller gives it to the map between the two views: a scene handed the
   * campus vector tiles fails to draw them, and a 2D view moved to another reference once it is
   * showing a map rescales, which brought the map back from 3D a zoom level out.
   */
  public async basemapForFlat(): Promise<{ basemap: esri.Basemap | undefined; reference: esri.SpatialReference | undefined }> {
    const instance = await firstValueFrom(this.ms.store);
    const basemap = this.basemapAfterScene ?? instance.map.basemap ?? undefined;

    this.basemapAfterScene = undefined;

    if (!basemap) {
      return { basemap: undefined, reference: undefined };
    }

    await basemap.load();

    const baseLayer = basemap.baseLayers.getItemAt(0);

    if (baseLayer && 'load' in baseLayer) {
      await baseLayer.load();
    }

    return {
      basemap,
      reference: (baseLayer as unknown as { spatialReference?: esri.SpatialReference } | undefined)?.spatialReference
    };
  }

  /**
   * Whether a visitor may choose the Aerial Imagery capture date.
   *
   * Everywhere, since 22 October 2026 (#2089). It was development-only while one question was open
   * (#1541): whether an older capture is billed differently from the current one. The maintainer
   * settled that, so the control is no longer gated.
   *
   * Kept as a property rather than inlined as `true`: it is read in three places, and a reason to gate
   * it again - a billing change, a Nearmap contract change - would otherwise have to find all of them.
   */
  public get canChooseNearmapDate(): boolean {
    return true;
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
      typeof esri.Basemap,
      typeof esri.WMSLayer
    ];

    await this.loadProjectOperator();

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
      const service = await this.nearmapService(layer);
      const capture = date ? (await this.readNearmapCaptures(instance)).find((c) => c.date === date) : undefined;

      if (service) {
        drawNearmapLayer(layer, capture ? capture.name : service.latest);
      }

      if (capture) {
        this.hideLayersForCapture(instance.map);
      } else {
        this.restoreLayersHiddenForCapture();
      }

      this.nearmapDate.set(capture?.date);
      this.setImageryParam(this.nearmapDate());

      await this.whenBasemapDrawn(instance.view);
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

    // Whichever way Aerial Imagery arrived - the panel, a saved choice, a link - it opens on the latest
    // imagery, asked for by one name. A link's capture is drawn after this, once the basemap is showing.
    const nearmap = this.nearmapLayer(instance);

    if (nearmap) {
      await this.showNearmapLatest(nearmap);
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

    // Read from the capabilities as they loaded: the layer itself draws only one of them once shown.
    const service = layer && (await this.nearmapService(layer));

    if (!service) {
      return [];
    }

    const projectOperator = await this.loadProjectOperator();

    const center = instance.view.center;
    const byDate = new Map<string, NearmapCapture>();

    service.captures.forEach((sublayer) => {
      const date = NEARMAP_SURVEY_NAME.exec(sublayer.name)?.[1];
      const extent = sublayer.fullExtent;

      if (!date || byDate.has(date)) {
        return;
      }

      const point = extent && projectOperator.execute(center, extent.spatialReference);

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

  private makeNearmapBasemap(Basemap: typeof esri.Basemap, WMSLayer: typeof esri.WMSLayer): esri.Basemap {
    const nearmapJSON = JSON.parse(JSON.stringify(NearmapCSBasemap.baseLayers[0]));

    // Remove the type property to prevent read-only property assignment error.
    delete nearmapJSON.type;

    const layer = new WMSLayer({ ...nearmapJSON });

    // The panel loads this layer for its thumbnail, before it is chosen, so its first image is already
    // the latest imagery by one name. A capture chosen since then is not undone by a late load.
    layer
      .when(() => {
        if (!this.nearmapDate()) {
          return this.showNearmapLatest(layer);
        }
      })
      .catch(() => undefined);

    return new Basemap({ ...NearmapCSBasemap, baseLayers: [layer] });
  }

  /** What a Nearmap layer's service offers, read from its capabilities the first time it is asked. */
  private async nearmapService(layer: esri.WMSLayer): Promise<NearmapService | undefined> {
    await layer.load();

    if (!this.nearmapServices.has(layer)) {
      const service = readNearmapService(layer);

      if (!service) {
        return undefined;
      }

      this.nearmapServices.set(layer, service);
    }

    return this.nearmapServices.get(layer);
  }

  /** Has a Nearmap layer draw its latest imagery, by one name. */
  private async showNearmapLatest(layer: esri.WMSLayer): Promise<void> {
    const service = await this.nearmapService(layer).catch(() => undefined);

    if (service) {
      drawNearmapLayer(layer, service.latest);
    }
  }

  /** The project operator, loaded: `setBasemap` needs it to move the view between references. */
  private async loadProjectOperator(): Promise<esri.projectOperator> {
    const [projectOperator] = (await this.mp.require(['projectOperator'])) as [esri.projectOperator];

    await projectOperator.load();

    return projectOperator;
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
   * Resolves once the basemap has finished drawing, or the whole view has, whichever is first.
   *
   * `map.basemap = ...` returns immediately; the tiles arrive afterwards. Callers showing a loading
   * state need the later moment, which is what makes the Aerial Imagery wait visible rather than
   * looking like nothing happened.
   *
   * The basemap's own layers, not the whole view: on a development host, changing the view's spatial
   * reference away from the campus vector tiles can leave an unrelated feature layer updating for good
   * under ArcGIS 5.1, and the basemap panel's spinner then never stopped (#1997).
   */
  private async whenBasemapDrawn(view: esri.MapView | esri.SceneView): Promise<void> {
    const [reactiveUtils] = (await this.mp.require(['reactiveUtils'])) as [esri.reactiveUtils];
    const layers = view.map?.basemap?.baseLayers.toArray() ?? [];

    await reactiveUtils.whenOnce(
      () =>
        !view.updating ||
        layers.every((layer) => {
          const layerView = view.allLayerViews.find((candidate) => candidate.layer === layer);

          return layerView !== undefined && !layerView.updating;
        })
    );
  }
}

/**
 * Whether a 3D scene can draw a basemap in this spatial reference. A scene here is a globe, which
 * takes Web Mercator and WGS 84 and nothing else; an unknown reference is given the benefit of the doubt.
 */
function drawsInAScene(reference: esri.SpatialReference | undefined | null): boolean {
  return !reference || reference.isWebMercator || reference.isWGS84;
}
