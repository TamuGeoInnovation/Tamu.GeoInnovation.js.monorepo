import { Routes } from '@angular/router';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';

import { LayerListService } from '@tamu-gisc/maps/feature/layer-list';

import { LegendComponent, LegendService } from '@tamu-gisc/maps/feature/legend';

import { ModalComponent, ReportBadRouteComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { AggiemapSidebarComponent, SidebarReferenceComponent, sidebarRoutes } from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import { AggiemapNgxUiMobileComponent, mobileRoutes } from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { BasemapGalleryService } from '@tamu-gisc/maps/feature/basemap';

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
        children: sidebarRoutes(SidebarReferenceComponent)
      },
      {
        path: 'm',
        component: AggiemapNgxUiMobileComponent,
        canActivateChild: [MobileGuard],
        children: mobileRoutes({ component: LegendComponent, data: { deduplicate: true } })
      },
      {
        path: 'modal',
        component: ModalComponent,
        children: [{ path: 'bad-route', component: ReportBadRouteComponent }]
      }
    ]
  }
];
