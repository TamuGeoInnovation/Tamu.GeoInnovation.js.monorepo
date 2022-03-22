import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance, ViewProperties } from '@tamu-gisc/maps/esri';

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

  public activeMode: '2D' | '3D' = '2D';

  private previousView: ViewProperties;
  private currentView: ViewProperties;

  @HostListener('click')
  public hostClick() {
    forkJoin([this.mp.require(['SceneView']), this.ms.store.pipe(take(1))])
      .pipe(
        map(([[SceneView], instance]: [[esri.SceneViewConstructor], MapServiceInstance]) => {
          return new SceneView({
            map: instance.map,
            viewpoint: instance.view.viewpoint.clone(),
            container: undefined
          });
        })
      )
      .subscribe((sceneview) => {
        this.ms.setView(sceneview);
        this.activeMode = '3D';
      });
  }

  constructor(private ms: EsriMapService, private mp: EsriModuleProviderService) {}
}
