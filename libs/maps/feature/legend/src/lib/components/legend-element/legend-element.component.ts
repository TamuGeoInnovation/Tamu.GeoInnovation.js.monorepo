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

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  @Input()
  public deduplicateChildren = false;

  public infos:
    | any[]
    | esri.SymbolTableElementType[]
    | esri.ColorRampStop[]
    | esri.OpacityRampStop[]
    | esri.SizeRampStop[]
    | esri.HeatmapRampStop[];

  public ngOnInit(): void {
    if (this.deduplicateChildren) {
      this.infos = this.element.infos.filter((info, index, self) => {
        return index === self.findIndex((t) => t.label === info.label);
      });
    } else {
      this.infos = this.element.infos;
    }
  }
}

// Browser doesn't like direct esri types for inputs.
type ILegendElement = esri.LegendElement;
