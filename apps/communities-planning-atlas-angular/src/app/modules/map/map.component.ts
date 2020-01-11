import { Component, OnInit } from '@angular/core';

import { MapConfig } from '@tamu-gisc/maps/esri';

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public config: MapConfig = {
    basemap: {
      basemap: 'topo'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-97.657046, 26.450253],
        zoom: 12
      }
    }
  };

  constructor() {}

  public ngOnInit() {}
}
