import { Component, OnInit } from '@angular/core';

import { MapConfig } from '@tamu-gisc/maps/esri';

@Component({
  selector: 'tamu-gisc-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  public mapConfig: MapConfig = {
    basemap: {
      basemap: 'dark-gray-vector'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-96.34553, 30.61252],
        zoom: 15
      }
    }
  };

  constructor() {}

  public ngOnInit(): void {}
}
