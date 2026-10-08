import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { PopupComponent, PopupMobileComponent, RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';
import {
  TripPlannerConnectionsSelectComponent,
  TripPlannerDirectionsComponent,
  TripPlannerDirectionsMobileComponent,
  TripPlannerDirectionsActionsComponent,
  TripPlannerDirectionsActionsMobileComponent,
  TripPlannerModePickerComponent,
  TripPlannerModePickerMobileComponent,
  TripPlannerModeSwitchComponent,
  TripPlannerBusModeSwitchComponent,
  TripPlannerModeToggleComponent,
  TripPlannerOptionsBaseComponent,
  TripPlannerBikingOptionsComponent,
  TripPlannerParkingOptionsComponent,
  TripPlannerOptionsComponent,
  TripPlannerTimePickerComponent,
  RouteDirectionTransformerPipe
} from '@tamu-gisc/maps/feature/trip-planner';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';
import { SidebarComponent, SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';

import { SidebarComponent } from './sidebar.component';
import { SidebarReferenceComponent } from './components/sidebar-reference/sidebar-reference.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UITamuBrandingModule,
    SidebarComponent,
    SidebarTabComponent,
    PopupComponent,
    PopupMobileComponent,
    RevealSidebarOnPopupDirective,
    SearchComponent,
    SearchMobileComponent,
    SearchResultPipe,
    TripPlannerConnectionsSelectComponent,
    TripPlannerDirectionsComponent,
    TripPlannerDirectionsMobileComponent,
    TripPlannerDirectionsActionsComponent,
    TripPlannerDirectionsActionsMobileComponent,
    TripPlannerModePickerComponent,
    TripPlannerModePickerMobileComponent,
    TripPlannerModeSwitchComponent,
    TripPlannerBusModeSwitchComponent,
    TripPlannerModeToggleComponent,
    TripPlannerOptionsBaseComponent,
    TripPlannerBikingOptionsComponent,
    TripPlannerParkingOptionsComponent,
    TripPlannerOptionsComponent,
    TripPlannerTimePickerComponent,
    RouteDirectionTransformerPipe,
    LayerListModule,
    LegendModule,
    SidebarComponent,
    SidebarReferenceComponent
  ],
  exports: [SidebarComponent]
})
export class UESSidebarModule {}
