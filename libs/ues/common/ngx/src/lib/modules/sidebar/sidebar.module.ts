import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { SearchModule } from '@tamu-gisc/search';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';

import { UESCoreUIModule } from '../core-ui/core-ui.module';
import { SidebarComponent } from './sidebar.component';
import { SidebarReferenceComponent } from './components/sidebar-reference/sidebar-reference.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UITamuBrandingModule,
    SidebarModule,
    MapPopupModule,
    SearchModule,
    MapsFeatureTripPlannerModule,
    LayerListModule,
    LegendModule,
    UESCoreUIModule
  ],
  declarations: [SidebarComponent, SidebarReferenceComponent],
  exports: [SidebarComponent]
})
export class UESSidebarModule {}
