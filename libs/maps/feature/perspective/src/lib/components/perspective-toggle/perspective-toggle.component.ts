import { Component, HostBinding, HostListener, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { firstValueFrom, forkJoin, map, Observable, take } from 'rxjs';

import { LayerSource } from '@tamu-gisc/common/types';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { BasemapGalleryService } from '@tamu-gisc/maps/feature/basemap';
import { NgClass } from '@angular/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-perspective-toggle',
  templateUrl: './perspective-toggle.component.html',
  styleUrls: ['./perspective-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass]
})
export class PerspectiveToggleComponent implements OnInit {
  private ms = inject(EsriMapService);
  private mp = inject(EsriModuleProviderService);
  private basemaps = inject(BasemapGalleryService);

  /**
   * Layers that should be applied when the perspective is changed to 3D
   */
  public readonly threeDLayers = input<Array<LayerSource>>(undefined);

  /**
   * Layers that should be applied when the perspective is changed to 2D
   */
  public readonly twoDLayers = input<Array<LayerSource>>(undefined);

  @HostBinding('class')
  public get componentDisplayClasses() {
    return ['esri-component', 'esri-widget--button', 'esri-widget'];
  }

  public activeMode: PerspectiveType = '2D';

  private perspectives: {
    threeD: esri.SceneView | undefined;
    twoD: esri.MapView | undefined;
  } = { threeD: undefined, twoD: undefined };

  private mapInstance: Observable<esri.Map>;

  /** The scale the 2D view was at when the map last went to 3D, and what the scene called it once tilted. */
  private flat: { scale: number; sceneScale: number | undefined } | undefined;

  @HostListener('click')
  public async hostClick() {
    const nextViewType = this.oppositeViewType();
    const leaving = await firstValueFrom(this.ms.store);

    // Where the map is looking now, said in a way both kinds of view agree on: the point at the
    // centre of the screen, the scale there, and which way is up. Not the outgoing view's viewpoint,
    // which out of a tilted scene describes the camera (#1724).
    const here = placeOf(leaving.view);

    if (nextViewType === '3D') {
      // A scene is a globe in Web Mercator. On a basemap in another reference it came up in that
      // reference with its 3D buildings flat (#1735), so the map is given a basemap a scene can draw
      // before the scene sees it.
      await this.basemaps.prepareForScene();
    }

    // Going back to 2D, the basemap 2D was on, or the one chosen while in 3D, goes back first, and
    // says which reference the 2D view has to be in to show it.
    const returning = nextViewType === '2D' ? await this.basemaps.basemapForFlat() : undefined;
    const view = await firstValueFrom(this.makeView(nextViewType));

    if (returning?.reference && view.type === '2d' && !view.spatialReference?.equals(returning.reference)) {
      view.spatialReference = returning.reference;
    }

    // The place, in the reference of the view about to show it. A scene and a 2D view on the campus
    // vector basemap are in different references, and a point handed across as it is lands nowhere.
    const place = here && (await this.projected(here, nextViewType === '3D' ? SCENE_REFERENCE : (returning?.reference ?? view.spatialReference)));

    if (place && nextViewType === '3D') {
      this.flat = { scale: here.scale, sceneScale: undefined };
    } else if (place && this.flat?.sceneScale) {
      // Back to the scale 2D was at, moved by however much the scene was zoomed while it was shown.
      // Not the scene's own scale: a tilted globe and a flat map do not count scale the same way, and
      // the two campus basemaps do not share a ladder of zoom levels, so the scene's number put the
      // 2D map back a level out. A change under 5% is the tilt settling, not a visitor zooming.
      const zoomed = here.scale / this.flat.sceneScale;

      place.scale = this.flat.scale * (Math.abs(zoomed - 1) < 0.05 ? 1 : zoomed);
    }

    this.removePerspectiveLayers();

    this.ms.setView(view, place, (shared) => {
      if (returning?.basemap) {
        shared.basemap = returning.basemap;
      }
    });
    this.activeMode = nextViewType;

    this.addPerspectiveLayers();

    if (view.type === '3d' && place) {
      // A scene given a flat viewpoint looks straight down, which makes the 3D buildings
      // indistinguishable from the 2D map. Tilt it, around the place: told only to tilt, the
      // camera swings and the centre of the screen lands somewhere else - about 2.4 km south on
      // the main map, and the map then came back to 2D still there.
      view.when(() => {
        view
          .goTo(
            { target: place.targetGeometry, scale: place.scale, heading: (360 - place.rotation) % 360, tilt: DEFAULT_3D_TILT },
            { animate: false }
          )
          .catch(() => {
            // `goTo` rejects when it is interrupted (e.g. the user toggles back to 2D
            // mid-transition). This is expected and safe to ignore.
          })
          .then(() => {
            // What the scene calls the scale 2D left at, to measure any zooming in 3D against.
            if (this.flat) {
              this.flat.sceneScale = view.scale;
            }
          });
      });
    }

  }

  /**
   * A place in another spatial reference: the point projected, the scale and rotation as they are.
   *
   * The scale is deliberately not corrected for the difference between a state plane map's scale and
   * Web Mercator's, which at campus's latitude is about 14%. Both basemaps are cached at the same
   * ladder of scales, so the same number is the same zoom level in each; corrected, the map came
   * back from 3D between two levels and snapped a whole level out.
   */
  private async projected(place: Place, reference: esri.SpatialReference | esri.SpatialReferenceProperties | undefined): Promise<Place> {
    const from = place.targetGeometry.spatialReference;
    const [projection, SpatialReference] = (await this.mp.require(['projection', 'SpatialReference'])) as [
      esri.projection,
      typeof esri.SpatialReference
    ];
    const to =
      reference instanceof SpatialReference
        ? reference
        : reference
          ? new SpatialReference(reference as esri.SpatialReferenceProperties)
          : from;

    if (!from || from.equals(to)) {
      return place;
    }

    await projection.load();

    return { ...place, targetGeometry: projection.project(place.targetGeometry, to) as esri.Point };
  }

  public ngOnInit(): void {
    this.ms.store
      .pipe(
        take(1),
        map((instance) => instance.view)
      )
      .subscribe((view) => {
        if (view.type === '2d') {
          this.perspectives.twoD = view;
        } else if (view.type === '3d') {
          this.perspectives.threeD = view;
        }
      });

    this.mapInstance = this.ms.store.pipe(map((instances) => instances?.map));
  }

  private oppositeViewType(): PerspectiveType {
    if (this.activeMode === '2D') {
      return '3D';
    } else {
      return '2D';
    }
  }

  private makeView(type: PerspectiveType): Observable<esri.SceneView | esri.MapView> {
    if (type === '3D') {
      return forkJoin([this.mp.require(['SceneView']), this.ms.store.pipe(take(1))]).pipe(
        map(([[SceneView], instance]: [[typeof esri.SceneView], MapServiceInstance]) => {
          if (this.perspectives.threeD === undefined) {
            // A globe in Web Mercator, said outright: left to work it out from the map, a scene on
            // the campus vector basemap came up in that basemap's state plane reference (#1735). No
            // viewpoint here; `setView` gives it the place.
            const view = new SceneView({
              map: instance.map,
              spatialReference: SCENE_REFERENCE,
              viewingMode: 'global',
              container: undefined
            });

            this.perspectives.threeD = view;

            return view;
          } else {
            return this.perspectives.threeD;
          }
        })
      );
    } else {
      return forkJoin([this.mp.require(['MapView']), this.ms.store.pipe(take(1))]).pipe(
        map(([[MapView], instance]: [[typeof esri.MapView], MapServiceInstance]) => {
          if (this.perspectives.twoD === undefined) {
            this.perspectives.twoD = new MapView({
              map: instance.map,
              viewpoint: instance.view.viewpoint.clone(),
              container: undefined
            });

            return this.perspectives.twoD;
          } else {
            return this.perspectives.twoD;
          }
        })
      );
    }
  }

  private removePerspectiveLayers() {
    const threeDLayers = this.threeDLayers();
    const twoDLayers = this.twoDLayers();
    if (this.activeMode === '3D' && threeDLayers !== undefined) {
      const layerIdsToRemove = threeDLayers.map((source) => source.id);

      this.ms.removeLayersById(layerIdsToRemove);
    } else if (this.activeMode === '2D' && twoDLayers !== undefined) {
      const layerIdsToRemove = twoDLayers.map((source) => source.id);

      this.ms.removeLayersById(layerIdsToRemove);
    }
  }

  public addPerspectiveLayers() {
    const threeDLayers = this.threeDLayers();
    const twoDLayers = this.twoDLayers();
    if (this.activeMode === '3D' && threeDLayers !== undefined) {
      this.ms.loadLayers(threeDLayers);
    } else if (this.activeMode === '2D' && twoDLayers !== undefined) {
      this.ms.loadLayers(twoDLayers);
    }
  }
}

type PerspectiveType = '2D' | '3D';

/** The spatial reference of every 3D scene: Web Mercator. */
const SCENE_REFERENCE = { wkid: 102100 };

/** Where a view is looking, in terms a view of either kind can be given. */
interface Place {
  targetGeometry: esri.Point;
  scale: number;
  /** Degrees, as a 2D view counts them. A scene's heading runs the other way round. */
  rotation: number;
}

/**
 * The place a view is looking at: the point at the centre of the screen, the scale there, and the
 * rotation. `undefined` for a view that has not got that far, when there is nothing to carry.
 */
function placeOf(view: esri.MapView | esri.SceneView | undefined): Place | undefined {
  if (!view?.center || !view.scale) {
    return undefined;
  }

  const rotation = view.type === '3d' ? (360 - (view.camera?.heading ?? 0)) % 360 : (view.rotation ?? 0);

  return { targetGeometry: view.center.clone(), scale: view.scale, rotation };
}

/**
 * Camera tilt (in degrees) applied each time the 3D perspective is activated. `0` is top-down;
 * higher values produce a more oblique view that highlights building heights.
 */
const DEFAULT_3D_TILT = 45;
