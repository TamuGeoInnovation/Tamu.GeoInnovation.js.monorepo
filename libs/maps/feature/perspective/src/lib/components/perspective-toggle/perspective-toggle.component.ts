import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { forkJoin, map, Observable, take } from 'rxjs';

import { LayerSource } from '@tamu-gisc/common/types';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-perspective-toggle',
  templateUrl: './perspective-toggle.component.html',
  styleUrls: ['./perspective-toggle.component.scss']
})
export class PerspectiveToggleComponent implements OnInit {
  /**
   * Layers that should be applied when the perspective is changed to 3D
   */
  @Input()
  public threeDLayers: Array<LayerSource>;

  /**
   * Layers that should be applied when the perspective is changed to 2D
   */
  @Input()
  public twoDLayers: Array<LayerSource>;

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

    this.makeView(nextViewType).subscribe((view) => {
      this.removePerspectiveLayers();

      this.ms.setView(view);
      this.activeMode = nextViewType;

      this.addPerspectiveLayers();
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

            // A SceneView cloned from the 2D viewpoint starts looking straight down, which makes the
            // newly loaded 3D buildings indistinguishable from the 2D map. Once the view is ready
            // (after its container is attached in `setView`), tilt the camera so the buildings are
            // clearly visible from an angle.
            view.when(() => {
              view.goTo({ tilt: DEFAULT_3D_TILT }).catch(() => {
                // `goTo` rejects when the animation is interrupted (e.g. the user toggles back to 2D
                // mid-transition). This is expected and safe to ignore.
              });
            });

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
    if (this.activeMode === '3D' && this.threeDLayers !== undefined) {
      const layerIdsToRemove = this.threeDLayers.map((source) => source.id);

      this.ms.removeLayersById(layerIdsToRemove);
    } else if (this.activeMode === '2D' && this.twoDLayers !== undefined) {
      const layerIdsToRemove = this.twoDLayers.map((source) => source.id);

      this.ms.removeLayersById(layerIdsToRemove);
    }
  }

  public addPerspectiveLayers() {
    if (this.activeMode === '3D' && this.threeDLayers !== undefined) {
      this.ms.loadLayers(this.threeDLayers);
    } else if (this.activeMode === '2D' && this.twoDLayers !== undefined) {
      this.ms.loadLayers(this.twoDLayers);
    }
  }

  constructor(private ms: EsriMapService, private mp: EsriModuleProviderService) {}
}

type PerspectiveType = '2D' | '3D';

/**
 * Camera tilt (in degrees) applied the first time the 3D perspective is activated. `0` is top-down;
 * higher values produce a more oblique view that highlights building heights. Because the SceneView
 * is cached for the lifetime of the component, this angle carries over to subsequent 3D activations.
 */
const DEFAULT_3D_TILT = 45;
