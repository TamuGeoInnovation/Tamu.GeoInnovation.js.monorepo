import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { TransportationModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';

import { AggiemapSidebarComponent } from './sidebar.component';
import { SidebarReferenceComponent } from './components/sidebar-reference/sidebar-reference.component';
import { SidebarTripPlannerComponent } from './components/sidebar-trip-planner/sidebar-trip-planner.component';
import { SidebarBusListComponent } from './components/sidebar-bus-list/sidebar-bus-list.component';

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
    TransportationModule
  ],
  declarations: [AggiemapSidebarComponent, SidebarReferenceComponent, SidebarTripPlannerComponent, SidebarBusListComponent],
  exports: [AggiemapSidebarComponent, SidebarReferenceComponent, SidebarTripPlannerComponent]
})
export class AggiemapSidebarModule {}
