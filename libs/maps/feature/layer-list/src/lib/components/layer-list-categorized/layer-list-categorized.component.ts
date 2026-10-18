import { Component } from '@angular/core';

import { arcgisSignal } from '@tamu-gisc/maps/esri';

import { LayerListComponent } from '../layer-list/layer-list.component';

import { LayerListItemComponent } from '../layer-list-item/layer-list-item.component';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-layer-list-categorized',
  templateUrl: './layer-list-categorized.component.html',
  styleUrls: ['../layer-list/layer-list.component.scss', './layer-list-categorized.component.scss'],
  imports: [AccordionComponent, AccordionHeaderComponent, AccordionContentComponent, LayerListItemComponent]
})
export class LayerListCategorizedComponent extends LayerListComponent {
  /**
   * Each top-level layer as a category of its sublayers. ArcGIS fills a group's children in, and
   * names it, once the group layer loads, so they are read through `arcgisSignal` (#1673).
   */
  public readonly categories = arcgisSignal(() =>
    this.layers().map((item) => ({ item, title: item.title, children: item.children?.toArray() ?? [] }))
  );
}
