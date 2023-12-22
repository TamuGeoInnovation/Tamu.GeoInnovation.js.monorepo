import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin, from, take } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapConfig, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-correction-lite-map',
  templateUrl: './correction-lite-map.component.html',
  styleUrls: ['./correction-lite-map.component.scss']
})
export class CorrectionLiteMapComponent implements OnInit {
  /**
   * This will limit when featureless clicks are emitted. If there is a row selected, then the application should
   * allow feature editing.
   */
  @Input()
  public focusedFeature: Record<string, unknown>;

  @Output()
  public featureLessClick: EventEmitter<{ lat: number; lon: number }> = new EventEmitter();

  public config: MapConfig;

  constructor(private readonly ms: EsriMapService, private readonly mp: EsriModuleProviderService) {}

  public ngOnInit(): void {
    this.config = {
      basemap: {
        basemap: 'streets-navigation-vector'
      },
      view: {
        mode: '2d',
        properties: {
          zoom: 4,
          center: [-98.5795, 39.8283],
          ui: {
            components: ['attribution', 'zoom']
          }
        }
      }
    };

    forkJoin([from(this.mp.require(['BasemapToggle'])), this.ms.store.pipe(take(1))]).subscribe(
      ([[BasemapToggle], instances]: [[esri.BasemapToggleConstructor], MapServiceInstance]) => {
        const toggle = new BasemapToggle({
          view: instances.view,
          nextBasemap: 'satellite'
        });

        instances.view.ui.add(toggle, 'bottom-right');
      }
    );

    this.ms.store.pipe(take(1)).subscribe((instance) => {
      instance.view.on('click', (e) => {
        if (this.focusedFeature) {
          this.featureLessClick.emit({ lat: e.mapPoint.latitude, lon: e.mapPoint.longitude });
        }
      });
    });
  }
}
