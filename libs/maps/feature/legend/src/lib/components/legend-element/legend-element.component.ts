import { Component, Input } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend-element',
  templateUrl: './legend-element.component.html',
  styleUrls: ['./legend-element.component.scss']
})
export class LegendElementComponent {
  @Input()
  public element: ILegendElement;

  @Input()
  public groupTitle: string;
}

// Browser doesn't like direct esri types for inputs.
type ILegendElement = esri.LegendElement;
