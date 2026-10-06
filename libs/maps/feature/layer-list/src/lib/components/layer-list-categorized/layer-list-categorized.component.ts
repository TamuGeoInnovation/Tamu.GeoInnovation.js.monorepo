import { Component, ChangeDetectionStrategy } from '@angular/core';

import { LayerListComponent } from '../layer-list/layer-list.component';

@Component({
  selector: 'tamu-gisc-layer-list-categorized',
  templateUrl: './layer-list-categorized.component.html',
  styleUrls: ['../layer-list/layer-list.component.scss', './layer-list-categorized.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class LayerListCategorizedComponent extends LayerListComponent {}
