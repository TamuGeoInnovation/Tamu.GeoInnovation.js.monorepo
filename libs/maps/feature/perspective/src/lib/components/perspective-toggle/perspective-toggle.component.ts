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
            this.perspectives.threeD = new SceneView({
              map: instance.map,
              viewpoint: instance.view.viewpoint.clone(),
              container: undefined
            });

            return this.perspectives.threeD;
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
