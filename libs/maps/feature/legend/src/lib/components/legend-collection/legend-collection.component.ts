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

  /**
   * Function used to track legend elements in the ngFor loop to prevent unnecessary re-renders.
   *
   * This is particularly important because nested LegendElements perform async network operations
   * on component init.
   */
  public trackByLegendElement(index: number, el: esri.LegendElement): string {
    const identifier = el?.infos ? el.infos?.map((i) => `${i.label}-${i.value}`).join(',') : null;

    return identifier;
  }
}

// Browser doesn't like direct esri types for inputs.
type IActiveLayerInfo = esri.ActiveLayerInfo;
type ILayer = esri.Layer;
