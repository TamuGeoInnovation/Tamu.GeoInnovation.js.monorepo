import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { DesktopGuard, MobileGuard } from '../../modules/routing/guards/device.guard';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { SkeletonModule } from '../../skeleton/skeleton.module';

import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';

import { TripPlannerConnectionService } from '../../modules/services/trip-planner/trip-planner-connection.service';
import { TripPlannerService } from '../../modules/services/trip-planner/trip-planner.service';
import { BusService } from '../services/transportation/bus/bus.service';
import { BikeService } from '../services/transportation/bike/bike.service';
import { ParkingService } from '../services/transportation/drive/parking.service';
import { InrixService } from '../services/transportation/drive/inrix.service';
import { EsriMapComponent } from '../../map/esri-map.component';

// Pipes
import { RouteDirectionTransformerPipe, SearchResultPipe } from '../../../assets/pipes/common.pipe';

// Directives
import { RenderHostDirective } from '../../modules/directives/render-host.directive';
import { ClipboardCopyDirective } from '../../modules/directives/clipboard-copy.directive';
import { DraggableDirective } from '../../modules/directives/draggable.directive';
import { AccordionDirective } from '../directives/accordion.directive';
import { AsyncContentLoadedDirective } from '../directives/async-content-loaded';

// Esri Map Child Components
import { SidebarComponent } from '../../modules/components/sidebar/containers/base/base.component';
import { SearchComponent } from '../../modules/components/search/containers/base/base.component';
import { TripPlannerComponent } from '../../modules/components/sidebar/components/trip-planner/trip-planner.component';
import { ReferenceComponent } from '../../modules/components/sidebar/components/reference/reference.component';
import { TripPlannerConnectionsSelectComponent } from '../../modules/components/trip-planner/trip-planner-connection-select/containers/base/base.component';
import { TripPlannerModePickerComponent } from '../../modules/components/trip-planner/trip-planner-mode-picker/containers/base/base.component';
import { TripPlannerModePickerMobileComponent } from '../../modules/components/trip-planner/trip-planner-mode-picker/containers/mobile/mobile.component';
import { TripPlannerDirectionsComponent } from '../../modules/components/trip-planner/trip-planner-directions/containers/base/base.component';
import { TripPlannerDirectionsMobileComponent } from '../../modules/components/trip-planner/trip-planner-directions/containers/mobile/mobile.component';
import { PopupComponent } from '../../modules/components/popup/containers/base/base.component';
import { PopupMobileComponent } from '../../modules/components/popup/containers/mobile/mobile.component';
import { BuildingPopupComponent } from '../../modules/components/popup/components/building/building-popup.component';
import { CopyComponent } from '../../modules/components/forms/copy/copy.component';

import { TripPlannerOptionsComponent } from '../../modules/components/trip-planner/trip-planner-options/containers/base/base.component';
import { TripPlannerOptionsComponentService } from '../components/trip-planner/trip-planner-options/services/trip-planner-options-component.service';
import { TripPlannerOptionsBaseComponent } from '../components/trip-planner/trip-planner-options/components/base/base.component';
import { TripPlannerParkingOptionsComponent } from '../components/trip-planner/trip-planner-options/components/parking/trip-planner-parking-options.component';
import { TripPlannerBikingOptionsComponent } from '../components/trip-planner/trip-planner-options/components/biking/trip-planner-biking-options.component';

import { BasePopupComponent } from '../../modules/components/popup/components/base/base.popup.component';
import { ConstructionPopupComponent } from '../../modules/components/popup/components/construction/construction.component';
import { PoiPopupComponent } from '../../modules/components/popup/components/poi/poi.component';
import { RestroomPopupComponent } from '../../modules/components/popup/components/restroom/restroom.component';
import { LactationPopupComponent } from '../../modules/components/popup/components/lactation/lactation.component';
import { ParkingKioskPopupComponent } from '../../modules/components/popup/components/parking-kiosk/parking-kiosk.component';
import { ParkingLotPopupComponent } from '../../modules/components/popup/components/parking-lot/parking-lot.component';
import { AccessiblePopupComponent } from '../../modules/components/popup/components/accessible/accessible.component';

import { MobileUIComponent } from '../../modules/components/mobile-ui/containers/main/mobile-ui.component';
import { MobileSearchComponent } from '../../modules/components/search/containers/mobile/mobile.component';
import { TripPlannerTopComponent } from '../../modules/components/mobile-ui/components/trip-planner-top/trip-planner-top.component';
import { OmnisearchComponent } from '../../modules/components/mobile-ui/components/omnisearch/omnisearch.component';
import { TripPlannerBottomComponent } from '../../modules/components/mobile-ui/components/trip-planner-bottom/trip-planner-bottom.component';
import { ReportBadRouteComponent } from '../../modules/components/forms/report-bad-route/report-bad-route.component';
import { MapViewfinderComponent } from '../../modules/components/accessibility/map-viewfinder/map-viewfinder.component';
import { TripPlannerDirectionsActions } from '../../modules/components/trip-planner/trip-planner-directions-actions/containers/base/base.component';
import { TripPlannerDirectionsActionsMobile } from '../../modules//components/trip-planner/trip-planner-directions-actions/containers/mobile/mobile.component';
import { TripPlannerModeToggleComponent } from '../components/trip-planner/trip-planner-mode-toggle/containers/base/base.component';

import { MobileSidebarComponent } from '../../modules/components/mobile-ui/components/sidebar/mobile-sidebar.component';
import { MainMobileSidebarComponent } from '../../modules/components/mobile-ui/components/sidebar/components/main/main.component';

import { BackdropComponent } from '../../modules//components/backdrop/backdrop.component';
import { ModalComponent } from '../../modules/components/modal/containers/main/base/base.component';

import { MapClickCoordinatesComponent } from '../../modules/components/map-coordinates/map-click-coordinates.component';
import { TripPlannerModeSwitchComponent } from '../../modules/components/trip-planner/trip-planner-mode-switch/containers/base/base.component';
import { TripPlannerBusModeSwitchComponent } from '../components/trip-planner/trip-planner-mode-switch/components/bus-switch/bus-switch.component';

import { BuildingDepartmentListComponent } from '../components/forms/building-department-list/building-department-list.component';
import { BusListComponent } from '../components/sidebar/components/bus-list/bus-list.component';
import { BusRouteComponent } from '../components/sidebar/components/bus-list/components/bus-route/bus-route.component';
import { BusTimetableComponent } from '../components/sidebar/components/bus-list/components/bus-timetable/bus-timetable.component';

import { TripPlannerTimePickerComponent } from '../components/trip-planner/trip-planner-time-picker/containers/base/base.component';
import { DlDateTimePickerDateModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';

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
          { path: 'bus', component: BusListComponent },
          { path: 'trip', component: TripPlannerComponent },
          { path: 'trip/options', component: TripPlannerOptionsComponent },
          { path: 'moveinout', component: ReferenceComponent }
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
              { path: 'layers', component: LayerListComponent }
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
  },
  {
    path: 'movein',
    loadChildren: () => import('../../modules/standalone/movein/movein..module').then((m) => m.MoveinoutModule)
  },
  { path: 'about', loadChildren: () => import('../../about/about.module').then((m) => m.AboutModule) },
  { path: 'changelog', loadChildren: () => import('../../changelog/changelog.module').then((m) => m.ChangelogModule) },
  { path: 'directory', loadChildren: () => import('../../directory/directory.module').then((m) => m.DirectoryModule) },
  { path: 'feedback', loadChildren: () => import('../../feedback/feedback.module').then((m) => m.FeedbackModule) },
  { path: 'privacy', loadChildren: () => import('../../privacy/privacy.module').then((m) => m.PrivacyModule) },
  {
    path: 'instructions',
    loadChildren: () => import('../../instructions/instructions.module').then((m) => m.InstructionsModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(hybridRoutes),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    SettingsModule,
    CommonNgxRouterModule,
    PipesModule,
    SkeletonModule,
    EsriMapModule,
    LayerListModule,
    LegendModule,
    SearchModule,
    TestingModule,
    ResponsiveModule,
    DlDateTimePickerDateModule,
    DlDateTimePickerModule,
    SidebarModule,
    UITamuBrandingModule,
    UIFormsModule,
    UILayoutModule
  ],
  declarations: [
    BackdropComponent,
    ModalComponent,
    EsriMapComponent,
    RouteDirectionTransformerPipe,
    SearchResultPipe,
    SidebarComponent,
    SearchComponent,
    TripPlannerComponent,
    ReferenceComponent,
    BusListComponent,
    BusRouteComponent,
    BusTimetableComponent,
    TripPlannerConnectionsSelectComponent,
    TripPlannerModePickerComponent,
    TripPlannerOptionsComponent,
    TripPlannerDirectionsComponent,
    TripPlannerDirectionsMobileComponent,
    TripPlannerModeSwitchComponent,
    TripPlannerBusModeSwitchComponent,
    TripPlannerTimePickerComponent,
    TripPlannerOptionsBaseComponent,
    TripPlannerParkingOptionsComponent,
    TripPlannerBikingOptionsComponent,
    PopupComponent,
    PopupMobileComponent,
    CopyComponent,
    BasePopupComponent,
    BuildingPopupComponent,
    ConstructionPopupComponent,
    PoiPopupComponent,
    RestroomPopupComponent,
    LactationPopupComponent,
    ParkingKioskPopupComponent,
    ParkingLotPopupComponent,
    AccessiblePopupComponent,
    MobileUIComponent,
    MobileSearchComponent,
    TripPlannerTopComponent,
    OmnisearchComponent,
    TripPlannerModePickerMobileComponent,
    TripPlannerBottomComponent,
    TripPlannerModeToggleComponent,
    ReportBadRouteComponent,
    MapViewfinderComponent,
    TripPlannerDirectionsActions,
    TripPlannerDirectionsActionsMobile,
    MobileSidebarComponent,
    MainMobileSidebarComponent,
    MapClickCoordinatesComponent,
    BuildingDepartmentListComponent,
    RenderHostDirective,
    ClipboardCopyDirective,
    DraggableDirective,
    AccordionDirective,
    AsyncContentLoadedDirective
  ],
  providers: [
    TripPlannerConnectionService,
    TripPlannerService,
    BusService,
    BikeService,
    ParkingService,
    InrixService,
    TripPlannerOptionsComponentService
  ],
  entryComponents: [
    BuildingPopupComponent,
    ConstructionPopupComponent,
    PoiPopupComponent,
    RestroomPopupComponent,
    LactationPopupComponent,
    ParkingKioskPopupComponent,
    ParkingLotPopupComponent,
    AccessiblePopupComponent,
    TripPlannerParkingOptionsComponent,
    TripPlannerBikingOptionsComponent
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
