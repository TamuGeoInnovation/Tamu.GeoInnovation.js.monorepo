import { Component, ChangeDetectionStrategy } from '@angular/core';

import { LayerListComponent } from '../layer-list/layer-list.component';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { LayerListItemComponent } from '../layer-list-item/layer-list-item.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-layer-list-categorized',
    templateUrl: './layer-list-categorized.component.html',
    styleUrls: ['../layer-list/layer-list.component.scss', './layer-list-categorized.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [UILayoutModule, LayerListItemComponent, AsyncPipe]
})
export class LayerListCategorizedComponent extends LayerListComponent {}
