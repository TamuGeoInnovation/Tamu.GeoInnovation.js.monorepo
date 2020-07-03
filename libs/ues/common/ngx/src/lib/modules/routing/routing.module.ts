import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { SESSION_STORAGE, LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';
import * as WebFont from 'webfontloader';

import { DesktopGuard, MobileGuard } from 'app/modules/routing/guards/device.guard';

// Modules
import { MapsFeatureTripPlannerModule, TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { UIStructuralLayoutModule } from '@tamu-gisc/ui-kits/ngx/layout/structural';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { LayerListModule, LayerListCategorizedComponent } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';

import { SearchModule } from '@tamu-gisc/search';

// Services
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

// Parent Components
import { EsriMapComponent } from 'app/map/esri-map.component';
// import { HeaderComponent } from 'app/skeleton/header/header.component';
// import { FooterComponent } from 'app/skeleton/footer/footer.component';
// import { InstructionsComponent } from 'app/instructions/instructions.component';
// import { PrivacyComponent } from 'app/privacy/privacy.component';

import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';

// Esri Map Child Components
import { SidebarComponent } from 'app/modules/components/sidebar/containers/base/base.component';
import { TripPlannerComponent } from 'app/modules/components/sidebar/components/trip-planner/trip-planner.component';
import { ReferenceComponent } from 'app/modules/components/sidebar/components/reference/reference.component';

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

WebFont.load({
  google: {
    families: ['Material Icons']
  },
  custom: {
    families: ['Moriston', 'Tungsten'],
    urls: ['assets/fonts/moriston_pro/moriston_pro.css', 'assets/fonts/tungsten/tungsten.css']
  }
});

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    component: EsriMapComponent,
    children: [
      {
        path: '',
        redirectTo: 'd',
        pathMatch: 'full'
      },
      {
        path: 'd',
        component: SidebarComponent,
        canActivateChild: [DesktopGuard],
        children: [
          { path: '', component: ReferenceComponent },
          { path: 'trip', component: TripPlannerComponent },
          { path: 'trip/options', component: TripPlannerOptionsComponent }
        ]
      },
      {
        path: 'm',
        component: MobileUIComponent,
        canActivateChild: [MobileGuard],
        children: [
          {
            path: '',
            children: [
              { path: '', component: OmnisearchComponent },
              { path: '', component: PopupMobileComponent, outlet: 'outlet-2' }
            ]
          },
          {
            path: 'trip',
            children: [
              { path: '', component: TripPlannerTopComponent },
              { path: '', component: TripPlannerBottomComponent, outlet: 'outlet-2' }
            ]
          },
          {
            path: 'search/:id',
            children: [{ path: '', component: OmnisearchComponent }]
          },
          {
            path: 'sidebar',
            component: MobileSidebarComponent,
            children: [
              { path: '', component: MainMobileSidebarComponent },
              { path: 'legend', component: LegendComponent },
              { path: 'layers', component: LayerListCategorizedComponent }
            ]
          }
        ]
      },
      {
        path: 'modal',
        component: ModalComponent,
        children: [{ path: 'bad-route', component: ReportBadRouteComponent }]
      }
    ]
  }
  // { path: 'privacy', component: PrivacyComponent },
  // { path: 'instructions', component: InstructionsComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(hybridRoutes, { initialNavigation: 'enabled' }),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    StorageServiceModule,
    PipesModule,
    UIStructuralLayoutModule,
    UIClipboardModule,
    UIDragModule,
    UILayoutModule,
    MapsFeatureTripPlannerModule,
    LayerListModule,
    EsriMapModule,
    LegendModule,
    SearchModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    TestingModule,
    UITamuBrandingModule,
    MapPopupModule,
    UIFormsModule,
    MapsFeatureAccessibilityModule,
    MapsFeatureCoordinatesModule
  ],
  declarations: [
    BackdropComponent,
    ModalComponent,
    EsriMapComponent,
    searchResultPipe,
    SidebarComponent,
    TripPlannerComponent,
    ReferenceComponent,
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
