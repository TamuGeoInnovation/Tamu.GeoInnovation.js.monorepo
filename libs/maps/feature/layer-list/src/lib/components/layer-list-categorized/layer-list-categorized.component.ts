import { Component, ChangeDetectionStrategy } from '@angular/core';

import { LayerListComponent } from '../layer-list/layer-list.component';

import { LayerListItemComponent } from '../layer-list-item/layer-list-item.component';
import { AsyncPipe } from '@angular/common';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
  selector: 'tamu-gisc-layer-list-categorized',
  templateUrl: './layer-list-categorized.component.html',
  styleUrls: ['../layer-list/layer-list.component.scss', './layer-list-categorized.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AccordionComponent, AccordionHeaderComponent, AccordionContentComponent, LayerListItemComponent, AsyncPipe]
})
export class LayerListCategorizedComponent extends LayerListComponent {}
