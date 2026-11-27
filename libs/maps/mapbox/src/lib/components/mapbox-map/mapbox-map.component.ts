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

  // Required: the template's one element, always there, and created before ngOnInit reads it.
  public readonly mapContainer = viewChild.required<ElementRef>('map');

  public readonly style = input<MapOptions['style'] | undefined>(undefined);

  public readonly center = input<MapOptions['center'] | undefined>(undefined);

  public readonly minZoom = input<MapOptions['minZoom'] | undefined>(undefined);

  public readonly maxZoom = input<MapOptions['maxZoom'] | undefined>(undefined);

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
