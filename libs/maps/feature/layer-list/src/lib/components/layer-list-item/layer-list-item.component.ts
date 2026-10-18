import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { NgClass } from '@angular/common';

import { TooltipComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TooltipTriggerComponent } from '@tamu-gisc/ui-kits/ngx/layout';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list-item',
  templateUrl: './layer-list-item.component.html',
  styleUrls: ['./layer-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, TooltipComponent, TooltipTriggerComponent]
})
export class LayerListItemComponent {
  public readonly listItem = input<IListItem>(undefined);

  // A model rather than an input: the component toggles it itself.
  public readonly expanded = model(true);

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
