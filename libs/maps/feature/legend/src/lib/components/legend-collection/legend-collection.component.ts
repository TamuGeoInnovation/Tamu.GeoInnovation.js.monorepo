import { Component, Input } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend-collection',
  templateUrl: './legend-collection.component.html',
  styleUrls: ['./legend-collection.component.scss']
})
export class LegendCollectionComponent {
  @Input()
  public group: IActiveLayerInfo;

  @Input()
  public layer: ILayer;

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  @Input()
  public deduplicate = false;

  @Input()
  public respectDefinitionExpression = false;
}

// Browser doesn't like direct esri types for inputs.
type IActiveLayerInfo = esri.ActiveLayerInfo;
type ILayer = esri.Layer;
