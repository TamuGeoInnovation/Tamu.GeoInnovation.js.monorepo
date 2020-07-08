import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { SearchModule } from '@tamu-gisc/search';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { TripPlannerTopComponent } from './components/trip-planner-top/trip-planner-top.component';
import { TripPlannerBottomComponent } from './components/trip-planner-bottom/trip-planner-bottom.component';
import { OmnisearchComponent } from './components/omnisearch/omnisearch.component';
import { AggiemapCoreUIModule } from '../core-ui/core-ui.module';
import { MobileUIComponent } from './mobile-ui.component';
import { MobileSidebarComponent } from './components/mobile-sidebar/mobile-sidebar.component';
import { MainMobileSidebarComponent } from './components/main-mobile-sidebar/main-mobile-sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MapsFeatureTripPlannerModule,
    UIDragModule,
    SearchModule,
    AggiemapCoreUIModule,
    UITamuBrandingModule
  ],
  declarations: [
    MobileUIComponent,
    TripPlannerTopComponent,
    TripPlannerBottomComponent,
    OmnisearchComponent,
    MobileSidebarComponent,
    MainMobileSidebarComponent
  ],
  exports: [
    MobileUIComponent,
    TripPlannerTopComponent,
    TripPlannerBottomComponent,
    OmnisearchComponent,
    MobileSidebarComponent,
    MainMobileSidebarComponent
  ]
})
export class AggiemapMobileUIModule {}
