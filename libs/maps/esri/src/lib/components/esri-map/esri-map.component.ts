import { Component, OnInit, ElementRef, OnDestroy, ChangeDetectionStrategy, inject, input, output, viewChild } from '@angular/core';
import { take } from 'rxjs/operators';

import { EsriMapService, MapConfig, MapServiceInstance } from '../../services/map/map.service';

@Component({
  selector: 'tamu-gisc-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class EsriMapComponent implements OnInit, OnDestroy {
  private mapService = inject(EsriMapService);

  public readonly config = input<MapConfig>(undefined);

  public readonly loaded = output<MapServiceInstance>();

  private readonly container = viewChild<ElementRef>('container');

  public ngOnInit() {
    const config = this.config();

    if (config && config.view && config.view.properties) {
      config.view.properties.container = this.container().nativeElement;
    } else {
      throw new Error(`Incorrectly formed configuration provided.`);
    }

    this.mapService.loadMap(config.basemap, config.view);

    this.mapService.store.pipe(take(1)).subscribe((store) => {
      this.loaded.emit(store);
    });
  }

  public ngOnDestroy() {
    this.mapService.destroy();
  }
}
