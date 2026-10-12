import { Component, OnInit, ElementRef, Output, ChangeDetectionStrategy, inject, input, viewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { MapboxOptions, Map } from 'mapbox-gl';

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

  @Output()
  public loaded: Observable<Map>;

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
