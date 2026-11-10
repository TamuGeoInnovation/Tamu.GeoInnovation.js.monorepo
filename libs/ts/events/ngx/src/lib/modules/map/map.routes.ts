import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { ModalComponent, ReportBadRouteComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import {
  AggiemapSidebarComponent,
  SIDEBAR_OPTIONS,
  SidebarOptions,
  sidebarRoutes
} from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import {
  OmnisearchComponent,
  loadTripPlannerBottomComponent,
  loadTripPlannerTopComponent,
  MobileSidebarComponent,
  MainMobileSidebarComponent,
  AggiemapNgxUiMobileComponent
} from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';

import { LayerListComponent, LayerListService } from '@tamu-gisc/maps/feature/layer-list';

import { PopupMobileDeferredComponent } from '@tamu-gisc/maps/feature/popup';

import { BasemapGalleryComponent, BasemapGalleryService } from '@tamu-gisc/maps/feature/basemap';

import { LegendService } from '@tamu-gisc/maps/feature/legend';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { MapComponent } from './map.component';
import { SidebarReferenceComponent } from '../sidebar/components/sidebar-reference/sidebar-reference.component';
import { EventLegendComponent } from './components/event-legend/event-legend.component';
import { SidebarRedirectGuard } from '../../guards/sidebar-redirect/sidebar-redirect.guard';
import { EventSettingsService } from '../../services/settings/event-settings.service';

/** The main map's side panel, with the tabs and branding this map's definition asks for (#2758). */
function eventSidebarOptions(): SidebarOptions {
  const configuration = inject(EventSettingsService).eventConfiguration()?.configuration;

  return {
    tabs: configuration?.sidebarTabs,
    brandingIconUrl: configuration?.brandingIconUrl,
    brandingIconAlt: configuration?.applicationName
  };
}

export const mapRoutes: Routes = [
  {
    path: '',
    component: MapComponent,
    // The services the map's NgModule used to scope to this lazy route (#1602). Whether each belongs at the root instead is #1603.
    providers: [LayerListService, LegendService, BasemapGalleryService, RouterHistoryService, TestingService],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [SidebarRedirectGuard],
        // Angular requires one of component/loadComponent/redirectTo/children/loadChildren on every
        // route. This route never actually renders children - when `SidebarRedirectGuard` allows
        // activation (kiosk maps), the outlet is simply left empty.
        children: []
      },
      {
        path: 'd',
        component: AggiemapSidebarComponent,
        providers: [{ provide: SIDEBAR_OPTIONS, useFactory: eventSidebarOptions }],
        canActivateChild: [DesktopGuard],
        children: sidebarRoutes(SidebarReferenceComponent)
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
              { path: '', component: PopupMobileDeferredComponent, outlet: 'outlet-2' }
            ]
          },
          {
            path: 'trip',
            children: [
              { path: '', loadComponent: loadTripPlannerTopComponent },
              { path: '', loadComponent: loadTripPlannerBottomComponent, outlet: 'outlet-2' }
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
              {
                path: 'legend',
                component: EventLegendComponent
              },
              { path: 'layers', component: LayerListComponent },
              { path: 'basemap', component: BasemapGalleryComponent }
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
