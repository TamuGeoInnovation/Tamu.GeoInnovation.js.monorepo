import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

// Services
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

// import { BasePopupComponent } from 'app/modules/components/popup/components/base/base.popup.component';
// import { BuildingPopupComponent } from 'app/modules/components/popup/components/building/building-popup.component';
// import { ConstructionPopupComponent } from 'app/modules/components/popup/components/construction/construction.component';
// import { PoiPopupComponent } from 'app/modules/components/popup/components/poi/poi.component';
// import { RestroomPopupComponent } from 'app/modules/components/popup/components/restroom/restroom.component';
// import { LactationPopupComponent } from 'app/modules/components/popup/components/lactation/lactation.component';
// import { ParkingKioskPopupComponent } from 'app/modules/components/popup/components/parking-kiosk/parking-kiosk.component';
// import { ParkingLotPopupComponent } from 'app/modules/components/popup/components/parking-lot/parking-lot.component';
// import { AccessiblePopupComponent } from 'app/modules/components/popup/components/accessible/accessible.component';

import { MobileUIComponent } from 'app/modules/components/mobile-ui/containers/main/mobile-ui.component';
import { TripPlannerTopComponent } from 'app/modules/components/mobile-ui/components/trip-planner-top/trip-planner-top.component';
import { OmnisearchComponent } from 'app/modules/components/mobile-ui/components/omnisearch/omnisearch.component';
import { TripPlannerBottomComponent } from 'app/modules/components/mobile-ui/components/trip-planner-bottom/trip-planner-bottom.component';
import { ReportBadRouteComponent } from 'app/modules/components/forms/report-bad-route/report-bad-route.component';

import { MobileSidebarComponent } from 'app/modules/components/mobile-ui/components/sidebar/mobile-sidebar.component';
import { MainMobileSidebarComponent } from 'app/modules/components/mobile-ui/components/sidebar/components/main/main.component';

import { BackdropComponent } from 'app/modules//components/backdrop/backdrop.component';
import { ModalComponent } from 'app/modules/components/modal/containers/main/base/base.component';

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    loadChildren: () => import('../map/map.module').then((m) => m.MapModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(hybridRoutes, { initialNavigation: 'enabled' }),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    TestingModule,
    UITamuBrandingModule
  ],
  declarations: [
    BackdropComponent,
    ModalComponent,
    MobileUIComponent,
    TripPlannerTopComponent,
    OmnisearchComponent,
    TripPlannerBottomComponent,
    ReportBadRouteComponent,
    MobileSidebarComponent,
    MainMobileSidebarComponent
  ],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule {}
