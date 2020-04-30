import { Component, OnInit, ViewChild, ElementRef, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { MapboxOptions, Map } from 'mapbox-gl';

import { MapboxMapService } from '../../services/mapbox-map.service';

@Component({
  selector: 'tamu-gisc-mapbox-map',
  templateUrl: './mapbox-map.component.html',
  styleUrls: ['./mapbox-map.component.scss']
})
export class MapboxMapComponent implements OnInit {
  @ViewChild('map', { static: true })
  public mapContainer: ElementRef;

  @Input()
  public token: string;

  @Input()
  public style: MapboxOptions['style'];

  @Input()
  public center: MapboxOptions['center'];

  @Input()
  public minZoom: MapboxOptions['minZoom'];

  @Input()
  public maxZoom: MapboxOptions['maxZoom'];

  @Output()
  public loaded: Observable<Map>;

  constructor(private mapService: MapboxMapService) {}

  public ngOnInit() {
    this.mapService.createMap({
      accessToken: this.token,
      container: this.mapContainer.nativeElement,
      style: this.style,
      center: this.center,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom
    });
  }
}
