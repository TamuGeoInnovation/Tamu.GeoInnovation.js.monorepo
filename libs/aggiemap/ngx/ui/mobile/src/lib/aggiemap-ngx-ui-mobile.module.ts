import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AggiemapNgxSharedUiStructuralModule, TransportationModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { AggiemapNgxUiMobileComponent } from './aggiemap-ngx-ui-mobile.component';
import { TripPlannerTopComponent } from './components/trip-planner-top/trip-planner-top.component';
import { TripPlannerBottomComponent } from './components/trip-planner-bottom/trip-planner-bottom.component';
import { OmnisearchComponent } from './components/omnisearch/omnisearch.component';
import { MobileSidebarComponent } from './components/mobile-sidebar/mobile-sidebar.component';
import { MainMobileSidebarComponent } from './components/main-mobile-sidebar/main-mobile-sidebar.component';
import { BusListBottomComponent } from './components/bus-list-bottom/bus-list-bottom.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AggiemapNgxSharedUiStructuralModule,
    MapsFeatureTripPlannerModule,
    UIDragModule,
    SearchModule,
    UITamuBrandingModule,
    TransportationModule
  ],
  declarations: [
    AggiemapNgxUiMobileComponent,
    TripPlannerTopComponent,
    TripPlannerBottomComponent,
    OmnisearchComponent,
    MobileSidebarComponent,
    MainMobileSidebarComponent,
    BusListBottomComponent
  ],
  exports: [
    AggiemapNgxUiMobileComponent,
    TripPlannerTopComponent,
    TripPlannerBottomComponent,
    OmnisearchComponent,
    MobileSidebarComponent,
    MainMobileSidebarComponent,
    BusListBottomComponent
  ]
})
export class AggiemapNgxUiMobileModule {}
