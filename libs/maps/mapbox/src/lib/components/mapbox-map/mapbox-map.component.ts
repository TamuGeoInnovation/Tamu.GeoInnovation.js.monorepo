import { Component, OnInit, ElementRef, ChangeDetectionStrategy, inject, input, viewChild } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { MapboxOptions } from 'mapbox-gl';

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

  public readonly token = input<string>(undefined);

  public readonly style = input<MapboxOptions['style']>(undefined);

  public readonly center = input<MapboxOptions['center']>(undefined);

  public readonly minZoom = input<MapboxOptions['minZoom']>(undefined);

  public readonly maxZoom = input<MapboxOptions['maxZoom']>(undefined);

  /**
   * Emits the map once it has loaded. It was declared as an output and never assigned, so no caller
   * listens to it; it now emits what its name says.
   */
  public readonly loaded = outputFromObservable(this.mapService.loaded);

  public ngOnInit() {
    this.mapService.createMap({
      accessToken: this.token(),
      container: this.mapContainer().nativeElement,
      style: this.style(),
      center: this.center(),
      minZoom: this.minZoom(),
      maxZoom: this.maxZoom()
    });
  }
}
