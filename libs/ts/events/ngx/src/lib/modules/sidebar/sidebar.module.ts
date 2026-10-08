import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';

import { MoveInOutSidebarComponent } from './sidebar.component';
import { SidebarReferenceComponent } from './components/sidebar-reference/sidebar-reference.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UITamuBrandingModule,
    LayerListModule,
    LegendModule,
    MoveInOutSidebarComponent,
    SidebarReferenceComponent
  ],
  exports: [MoveInOutSidebarComponent]
})
export class MoveInOutSidebarModule {}
