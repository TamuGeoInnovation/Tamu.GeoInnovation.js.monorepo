import { Component, Input } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list-item',
  templateUrl: './layer-list-item.component.html',
  styleUrls: ['./layer-list-item.component.scss']
})
export class LayerListItemComponent {
  @Input()
  public listItem: IListItem;

  @Input()
  public expanded = true;

  /**
   * A group layer source marked `listHeading` is listed as a heading: it has no visibility toggle,
   * and its children are toggled individually.
   */
  public get isHeading(): boolean {
    return this.listItem?.layer?.['listHeading'] === true;
  }

  public toggleLayer(): void {
    // If the list item contains an initialized layer, flip the visible value.
    if (this.listItem.layer && !this.isHeading) {
      this.listItem.layer.visible = !this.listItem.layer.visible;
    }
  }

  public toggleExpanded() {
    this.expanded = !this.expanded;
  }
}

// Browser doesn't like direct esri types for inputs.
type IListItem = esri.ListItem;
