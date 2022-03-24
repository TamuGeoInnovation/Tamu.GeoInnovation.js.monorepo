import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { forkJoin, map, Observable, take } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-perspective-toggle',
  templateUrl: './perspective-toggle.component.html',
  styleUrls: ['./perspective-toggle.component.scss']
})
export class PerspectiveToggleComponent implements OnInit {
  @Input()
  public threeDLayers: Array<esri.Layer>;

  @Input()
  public twoDLayers: Array<esri.Layer>;

  @HostBinding('class')
  public get componentDisplayClasses() {
    return ['esri-component', 'esri-widget--button', 'esri-widget'];
  }

  public activeMode: PerspectiveType = '2D';

  private perspectives: {
    threeD: esri.SceneView | undefined;
    twoD: esri.MapView | undefined;
  } = { threeD: undefined, twoD: undefined };

  @HostListener('click')
  public hostClick() {
    const nextViewType = this.oppositeViewType();
    this.makeView(nextViewType).subscribe((view) => {
      this.ms.setView(view);
      this.activeMode = nextViewType;
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

  constructor(private ms: EsriMapService, private mp: EsriModuleProviderService) {}
}

type PerspectiveType = '2D' | '3D';
