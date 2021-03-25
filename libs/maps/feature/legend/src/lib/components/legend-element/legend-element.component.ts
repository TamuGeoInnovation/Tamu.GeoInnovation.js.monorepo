import { Component, Input, OnInit } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend-element',
  templateUrl: './legend-element.component.html',
  styleUrls: ['./legend-element.component.scss']
})
export class LegendElementComponent implements OnInit {
  @Input()
  public element: ILegendElement;

  @Input()
  public groupTitle: string;

  constructor() {}

  public ngOnInit(): void {}
}

type ILegendElement = esri.LegendElement;
