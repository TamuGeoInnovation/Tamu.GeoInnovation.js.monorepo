import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';

import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { SearchModule } from '@tamu-gisc/search';

import { TripPlannerTopComponent } from './components/trip-planner-top/trip-planner-top.component';
import { TripPlannerBottomComponent } from './components/trip-planner-bottom/trip-planner-bottom.component';
import { OmnisearchComponent } from './components/omnisearch/omnisearch.component';
import { AggiemapCoreUIModule } from '../core-ui/core-ui.module';
import { MobileUIComponent } from './mobile-ui.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, MapsFeatureTripPlannerModule, UIDragModule, SearchModule, AggiemapCoreUIModule],
  declarations: [MobileUIComponent, TripPlannerTopComponent, TripPlannerBottomComponent, OmnisearchComponent],
  exports: [MobileUIComponent, TripPlannerTopComponent, TripPlannerBottomComponent, OmnisearchComponent]
})
export class UIMobileModule {}
