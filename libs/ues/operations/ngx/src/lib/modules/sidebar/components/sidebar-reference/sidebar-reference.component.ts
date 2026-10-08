import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SidebarReferenceComponent as AggiemapSidebarReferenceComponent } from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import { SearchComponent } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerListCategorizedComponent } from '@tamu-gisc/maps/feature/layer-list';
import { LegendComponent } from '@tamu-gisc/maps/feature/legend';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SearchComponent, LayerListCategorizedComponent, LegendComponent]
})
export class SidebarReferenceComponent<T extends esri.Graphic> extends AggiemapSidebarReferenceComponent<T> {}
