import { Component, OnInit } from '@angular/core';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { SignageService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-signage',
  templateUrl: './signage.component.html',
  styleUrls: ['./signage.component.scss']
})
export class SignageComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private signageService: SignageService) {}

  public ngOnInit(): void {
    // TODO: Finish this -Aaron (1/5/2021)
    this.mapService.loaded.subscribe((map) => {
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
