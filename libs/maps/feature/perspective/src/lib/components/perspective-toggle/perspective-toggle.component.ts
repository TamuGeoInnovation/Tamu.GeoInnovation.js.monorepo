import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { forkJoin, map, Observable, take } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-perspective-toggle',
  templateUrl: './perspective-toggle.component.html',
  styleUrls: ['./perspective-toggle.component.scss']
})
export class PerspectiveToggleComponent {
  @Input()
  public threeDLayers: Array<esri.Layer>;

  @Input()
  public twoDLayers: Array<esri.Layer>;

  @HostBinding('class')
  public get componentDisplayClasses() {
    return ['esri-component', 'esri-widget--button', 'esri-widget'];
  }

  public activeMode: PerspectiveType = '2D';

  @HostListener('click')
  public hostClick() {
    const nextViewType = this.oppositeViewType();
    this.makeView(nextViewType).subscribe((view) => {
      this.ms.setView(view);
      this.activeMode = nextViewType;
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
          return new SceneView({
            map: instance.map,
            viewpoint: instance.view.viewpoint.clone(),
            container: undefined
          });
        })
      );
    } else {
      return forkJoin([this.mp.require(['MapView']), this.ms.store.pipe(take(1))]).pipe(
        map(([[MapView], instance]: [[esri.MapViewConstructor], MapServiceInstance]) => {
          return new MapView({
            map: instance.map,
            viewpoint: instance.view.viewpoint.clone(),
            container: undefined
          });
        })
      );
    }
  }

  constructor(private ms: EsriMapService, private mp: EsriModuleProviderService) {}
}

type PerspectiveType = '2D' | '3D';
