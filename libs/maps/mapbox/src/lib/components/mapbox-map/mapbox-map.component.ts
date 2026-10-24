import { Component, OnInit, ElementRef, ChangeDetectionStrategy, inject, input, viewChild } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { MapOptions } from 'maplibre-gl';

import { MapboxMapService } from '../../services/mapbox-map.service';

@Component({
  selector: 'tamu-gisc-mapbox-map',
  templateUrl: './mapbox-map.component.html',
  styleUrls: ['./mapbox-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class MapboxMapComponent implements OnInit {
  private mapService = inject(MapboxMapService);

  public readonly mapContainer = viewChild<ElementRef>('map');

  public readonly style = input<MapOptions['style']>(undefined);

  public readonly center = input<MapOptions['center']>(undefined);

  public readonly minZoom = input<MapOptions['minZoom']>(undefined);

  public readonly maxZoom = input<MapOptions['maxZoom']>(undefined);

  /**
   * Emits the map once it has loaded. It was declared as an output and never assigned, so no caller
   * listens to it; it now emits what its name says.
   */
  public readonly loaded = outputFromObservable(this.mapService.loaded);

  public ngOnInit() {
    this.mapService.createMap({
      container: this.mapContainer().nativeElement,
      style: this.style(),
      center: this.center(),
      minZoom: this.minZoom(),
      maxZoom: this.maxZoom()
    });
  }
}
