import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DlDateTimePickerModule, DlDateTimePickerDateModule } from 'angular-bootstrap-datetimepicker';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { TripPlannerConnectionsSelectComponent } from './components/trip-planner-connection-select/containers/base/base.component';
import { TripPlannerDirectionsComponent } from './components/trip-planner-directions/containers/base/base.component';
import { TripPlannerDirectionsMobileComponent } from './components/trip-planner-directions/containers/mobile/mobile.component';
import { TripPlannerDirectionsActionsComponent } from './components/trip-planner-directions-actions/containers/base/base.component';
import { TripPlannerDirectionsActionsMobileComponent } from './components/trip-planner-directions-actions/containers/mobile/mobile.component';
import { TripPlannerModePickerComponent } from './components/trip-planner-mode-picker/containers/base/base.component';
import { TripPlannerModePickerMobileComponent } from './components/trip-planner-mode-picker/containers/mobile/mobile.component';
import { TripPlannerModeSwitchComponent } from './components/trip-planner-mode-switch/containers/base/base.component';
import { TripPlannerBusModeSwitchComponent } from './components/trip-planner-mode-switch/components/bus-switch/bus-switch.component';
import { TripPlannerModeToggleComponent } from './components/trip-planner-mode-toggle/containers/base/base.component';
import { TripPlannerOptionsBaseComponent } from './components/trip-planner-options/components/base/base.component';
import { TripPlannerBikingOptionsComponent } from './components/trip-planner-options/components/biking/trip-planner-biking-options.component';
import { TripPlannerParkingOptionsComponent } from './components/trip-planner-options/components/parking/trip-planner-parking-options.component';
import { TripPlannerOptionsComponent } from './components/trip-planner-options/containers/base/base.component';
import { TripPlannerTimePickerComponent } from './components/trip-planner-time-picker/containers/base/base.component';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { RouteDirectionTransformerPipe } from './core/route-direction-transformer.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DlDateTimePickerModule,
    DlDateTimePickerDateModule,
    UIFormsModule,
    UILayoutModule,
    UIClipboardModule,
    PipesModule
  ],
  declarations: [
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
  ],
  exports: [
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
  ]
})
export class MapsFeatureTripPlannerModule {}
