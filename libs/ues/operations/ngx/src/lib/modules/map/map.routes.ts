import { Routes } from '@angular/router';

import { ModalComponent, ReportBadRouteComponent, BusListComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { SidebarTripPlannerComponent } from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import {
  AggiemapNgxUiMobileComponent,
  TripPlannerBottomComponent,
  TripPlannerTopComponent,
  MainMobileSidebarComponent,
  MobileSidebarComponent,
  OmnisearchComponent
} from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';
import { EsriModuleProviderService, EsriMapService } from '@tamu-gisc/maps/esri';
// The shared sidebar's component, renamed here because UES has a SidebarComponent of its own.
import { LayerListCategorizedComponent, LayerListService } from '@tamu-gisc/maps/feature/layer-list';
import { LegendComponent, LegendService } from '@tamu-gisc/maps/feature/legend';
import { TripPlannerOptionsComponent, TripPlannerService, BusService } from '@tamu-gisc/maps/feature/trip-planner';
import { PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';

import { BasemapGalleryService } from '@tamu-gisc/maps/feature/basemap';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { MapComponent } from './map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarReferenceComponent } from '../sidebar/components/sidebar-reference/sidebar-reference.component';

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
        component: SidebarComponent,
        canActivateChild: [DesktopGuard],
        children: [
          { path: '', component: SidebarReferenceComponent },
          { path: 'bus', component: BusListComponent },
          { path: 'trip', component: SidebarTripPlannerComponent },
          { path: 'trip/options', component: TripPlannerOptionsComponent }
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
];

// The services the map's NgModule used to scope to this lazy route (#1602). Whether each belongs at the root instead is #1603.
export const mapRoutes: Routes = [
  {
    path: '',
    providers: [
      EsriModuleProviderService,
      EsriMapService,
      TripPlannerService,
      BusService,
      LayerListService,
      LegendService,
      BasemapGalleryService,
      TestingService
    ],
    children: routes
  }
];
