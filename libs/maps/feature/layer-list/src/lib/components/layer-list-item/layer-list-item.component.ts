import { Component, input, model } from '@angular/core';
import { NgClass } from '@angular/common';

import { arcgisSignal } from '@tamu-gisc/maps/esri';

import { TooltipComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TooltipTriggerComponent } from '@tamu-gisc/ui-kits/ngx/layout';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list-item',
  templateUrl: './layer-list-item.component.html',
  styleUrls: ['./layer-list-item.component.scss'],
  imports: [NgClass, TooltipComponent, TooltipTriggerComponent]
})
export class LayerListItemComponent {
  public readonly listItem = input<IListItem>(undefined);

  // A model rather than an input: the component toggles it itself.
  public readonly expanded = model(true);

  /**
   * What the row shows of its item, all of which ArcGIS changes in place: whether the layer is on
   * (from here, the legend or a link), drawing, out of scale or failed, and its sublayers (#1673).
   */
  public readonly state = arcgisSignal(() => {
    const item = this.listItem();

    return {
      title: item?.title,
      visible: item?.visible === true,
      visibleAtCurrentScale: item?.visibleAtCurrentScale,
      updating: item?.updating,
      error: !!item?.error,
      children: item?.children?.toArray() ?? []
    };
  });

  /**
   * A group layer source marked `listHeading` is listed as a heading: it has no visibility toggle,
   * and its children are toggled individually.
   */
  public get isHeading(): boolean {
    return this.listItem()?.layer?.['listHeading'] === true;
  }

  public toggleLayer(): void {
    // If the list item contains an initialized layer, flip the visible value.
    const layer = this.listItem().layer;

    if (layer && !this.isHeading) {
      layer.visible = !layer.visible;
    }
  }

  public toggleExpanded() {
    this.expanded.set(!this.expanded());
  }
}

// Browser doesn't like direct esri types for inputs.
type IListItem = esri.ListItem;
