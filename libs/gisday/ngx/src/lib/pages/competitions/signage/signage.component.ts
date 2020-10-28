import { Component, OnInit } from '@angular/core';
import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { Popup } from 'mapbox-gl';

@Component({
  selector: 'tamu-gisc-signage',
  templateUrl: './signage.component.html',
  styleUrls: ['./signage.component.scss']
})
export class SignageComponent implements OnInit {
  constructor(private mapService: MapboxMapService) {}

  public ngOnInit(): void {
    this.mapService.loaded.subscribe((map) => {
      const zoomThreshold = 3;

      const popup = new Popup({
        closeButton: false
      });

      map.addSource('cases', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.covid'
      });
    });
  }
}
