import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DlDateTimePickerDateModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import { MapsFeatureTripPlannerModule, TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { MapsFeaturePerspectiveModule } from '@tamu-gisc/maps/feature/perspective';

import {
  AggiemapNgxSharedUiStructuralModule,
  TransportationModule,
  ModalComponent,
  ReportBadRouteComponent,
  AggiemapFormsModule,
  ExperimentsModule,
  ExperimentsListComponent
} from '@tamu-gisc/aggiemap/ngx/ui/shared';
import {
  AggiemapSidebarModule,
  AggiemapSidebarComponent,
  SidebarReferenceComponent,
  SidebarTripPlannerComponent,
  SidebarBusListComponent
} from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import {
  AggiemapNgxUiMobileModule,
  OmnisearchComponent,
  TripPlannerBottomComponent,
  TripPlannerTopComponent,
  MobileSidebarComponent,
  MainMobileSidebarComponent,
  AggiemapNgxUiMobileComponent,
  BusListBottomComponent,
  BusTimetableBottomComponent
} from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';

import { MapComponent } from './map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    children: [
      {
        path: '',
        redirectTo: 'd',
        pathMatch: 'full'
      },
      {
        path: 'd',
        component: AggiemapSidebarComponent,
        canActivateChild: [DesktopGuard],
        children: [
          { path: '', component: SidebarReferenceComponent },
          { path: 'bus', component: SidebarBusListComponent },
          { path: 'trip', component: SidebarTripPlannerComponent },
          { path: 'trip/options', component: TripPlannerOptionsComponent },
          { path: 'experiments', component: ExperimentsListComponent }
        ]
      },
      {
        path: 'm',
        component: AggiemapNgxUiMobileComponent,
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
          },
          {
            path: 'bus/:route',
            children: [
              {
                path: '',
                component: BusTimetableBottomComponent,
                outlet: 'outlet-2'
              }
            ]
          },
          {
            path: 'bus',
            children: [
              {
                path: '',
                component: BusListBottomComponent,
                outlet: 'outlet-2'
              }
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
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SettingsModule,
    CommonNgxRouterModule,
    PipesModule,
    EsriMapModule,
    LayerListModule,
    LegendModule,
    MapsFeatureAccessibilityModule,
    SearchModule,
    TestingModule,
    ResponsiveModule,
    DlDateTimePickerDateModule,
    DlDateTimePickerModule,
    SidebarModule,
    UITamuBrandingModule,
    UIFormsModule,
    UILayoutModule,
    UIDragModule,
    UIClipboardModule,
    MapsFeatureTripPlannerModule,
    MapPopupModule,
    AggiemapNgxPopupsModule,
    TransportationModule,
    AggiemapSidebarModule,
    AggiemapNgxSharedUiStructuralModule,
    AggiemapNgxUiMobileModule,
    MapsFeatureCoordinatesModule,
    AggiemapFormsModule,
    MapsFeaturePerspectiveModule,
    ExperimentsModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
