import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';

import { MapsFeatureBasemapGalleryModule } from '@tamu-gisc/maps/feature/basemap';

import { AggiemapSidebarComponent } from './sidebar.component';
import { SidebarReferenceComponent } from './components/sidebar-reference/sidebar-reference.component';
import { SidebarTripPlannerComponent } from './components/sidebar-trip-planner/sidebar-trip-planner.component';
import { SidebarBusListComponent } from './components/sidebar-bus-list/sidebar-bus-list.component';
import { SidebarSettingsComponent } from './components/sidebar-settings/sidebar-settings.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UITamuBrandingModule,
    LayerListModule,
    LegendModule,
    MapsFeatureBasemapGalleryModule,
    AggiemapSidebarComponent,
    SidebarReferenceComponent,
    SidebarTripPlannerComponent,
    SidebarBusListComponent,
    SidebarSettingsComponent
  ],
  exports: [AggiemapSidebarComponent, SidebarReferenceComponent, SidebarTripPlannerComponent, SidebarSettingsComponent]
})
export class AggiemapSidebarModule {}
