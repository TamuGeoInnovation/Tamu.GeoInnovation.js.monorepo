import { Routes } from '@angular/router';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';

import { LayerListComponent, LayerListService } from '@tamu-gisc/maps/feature/layer-list';

import { LegendComponent, LegendService } from '@tamu-gisc/maps/feature/legend';
import { TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';

import { ModalComponent, ReportBadRouteComponent, ExperimentsListComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import {
  AggiemapSidebarComponent,
  SidebarReferenceComponent,
  SidebarTripPlannerComponent,
  SidebarBusListComponent,
  SidebarSettingsComponent
} from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import {
  OmnisearchComponent,
  TripPlannerBottomComponent,
  TripPlannerTopComponent,
  MobileSidebarComponent,
  MainMobileSidebarComponent,
  AggiemapNgxUiMobileComponent,
  BusListBottomComponent,
  BusTimetableBottomComponent
} from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { BasemapGalleryComponent, BasemapGalleryService } from '@tamu-gisc/maps/feature/basemap';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { MapComponent } from './map.component';

export const mapRoutes: Routes = [
  {
    path: '',
    component: MapComponent,
    // The services the map's NgModule used to scope to this lazy route (#1602). Whether each belongs at the root instead is #1603.
    providers: [LayerListService, LegendService, BasemapGalleryService, RouterHistoryService, TestingService],
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
          { path: 'experiments', component: ExperimentsListComponent },
          { path: 'settings', component: SidebarSettingsComponent }
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
              { path: 'legend', component: LegendComponent, data: { deduplicate: true } },
              { path: 'layers', component: LayerListComponent },
              { path: 'basemap', component: BasemapGalleryComponent }
            ]
          },
          {
            path: 'bus/:route',
            children: [
              {
                path: '',
                component: OmnisearchComponent
              },
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
                component: OmnisearchComponent
              },
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
