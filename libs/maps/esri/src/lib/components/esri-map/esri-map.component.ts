import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { take } from 'rxjs/operators';

import { EsriMapService, MapConfig, MapServiceInstance } from '../../services/map.service';

@Component({
  selector: 'tamu-gisc-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  @Input()
  public config: MapConfig;

  @Output()
  public loaded: EventEmitter<MapServiceInstance> = new EventEmitter();

  @ViewChild('container', { static: true })
  private container: ElementRef;

  constructor(private mapService: EsriMapService) {}

  public ngOnInit() {
    if (this.config && this.config.view && this.config.view.properties) {
      this.config.view.properties.container = this.container.nativeElement;
    } else {
      throw new Error(`Incorrectly formed configuration provided.`);
    }

    this.mapService.loadMap(this.config.basemap, this.config.view);

    this.mapService.store.pipe(take(1)).subscribe((store) => {
      this.loaded.emit(store);
    });
  }

  public ngOnDestroy() {
    this.mapService.destroy();
  }
}
