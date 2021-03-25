import { Component, Input, OnInit } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list-item',
  templateUrl: './layer-list-item.component.html',
  styleUrls: ['./layer-list-item.component.scss']
})
export class LayerListItemComponent implements OnInit {
  @Input()
  public listItem: IListItem;

  constructor() {}

  public ngOnInit(): void {}

  public toggleLayer(): void {
    // If the list item contains an initialized layer, flip the visible value.
    if (this.listItem.layer) {
      this.listItem.layer.visible = !this.listItem.layer.visible;
    }
  }
}

// Browser doesn't like direct esri types for inputs.
type IListItem = esri.ListItem;
