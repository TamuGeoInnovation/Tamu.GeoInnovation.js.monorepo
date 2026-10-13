import { Component, HostBinding, HostListener, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { forkJoin, map, Observable, take } from 'rxjs';

import { LayerSource } from '@tamu-gisc/common/types';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
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

  @HostListener('click')
  public hostClick() {
    const nextViewType = this.oppositeViewType();

    forkJoin([this.makeView(nextViewType), this.ms.store.pipe(take(1))]).subscribe(([view, leaving]) => {
      // Where the map is looking now, said in a way both kinds of view agree on: the point at the
      // centre of the screen, the scale there, and which way is up. Not the outgoing view's viewpoint,
      // which out of a tilted scene describes the camera (#1724).
      const place = placeOf(leaving.view);

      this.removePerspectiveLayers();

      this.ms.setView(view, place);
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
            });
        });
      }
    });
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
        map(([[SceneView], instance]: [[esri.SceneViewConstructor], MapServiceInstance]) => {
          if (this.perspectives.threeD === undefined) {
            const view = new SceneView({
              map: instance.map,
              viewpoint: instance.view.viewpoint.clone(),
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
        map(([[MapView], instance]: [[esri.MapViewConstructor], MapServiceInstance]) => {
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
