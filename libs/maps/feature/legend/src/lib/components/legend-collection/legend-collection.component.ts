import { Component, Input, OnInit } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend-collection',
  templateUrl: './legend-collection.component.html',
  styleUrls: ['./legend-collection.component.scss']
})
export class LegendCollectionComponent implements OnInit {
  @Input()
  public group: IActiveLayerInfo;

  constructor() {}

  public ngOnInit(): void {}
}

type IActiveLayerInfo = esri.ActiveLayerInfo;
