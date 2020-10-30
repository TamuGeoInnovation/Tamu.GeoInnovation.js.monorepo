import { Component, OnInit } from '@angular/core';
import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { Popup } from 'mapbox-gl';

import { SignageService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-signage',
  templateUrl: './signage.component.html',
  styleUrls: ['./signage.component.scss']
})
export class SignageComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private signageService: SignageService) {}

  public ngOnInit(): void {
    this.mapService.loaded.subscribe((map) => {
      const zoomThreshold = 3;

      const popup = new Popup({
        closeButton: false
      });

      const signage = this.signageService.getSignage();
      signage.subscribe((result) => {
        console.log(result);
      });
      map.addSource('cases', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.covid'
      });
    });
  }
}
