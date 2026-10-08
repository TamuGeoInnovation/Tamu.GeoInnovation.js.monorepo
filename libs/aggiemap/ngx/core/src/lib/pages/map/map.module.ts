import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';



import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';



import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';


import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import { TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';




import { ModalComponent, ReportBadRouteComponent, ExperimentsListComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import {
  AggiemapSidebarModule,
  AggiemapSidebarComponent,
  SidebarReferenceComponent,
  SidebarTripPlannerComponent,
  SidebarBusListComponent,
  SidebarSettingsComponent
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
import { BasemapGalleryComponent } from '@tamu-gisc/maps/feature/basemap';

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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SettingsModule,
    CommonNgxRouterModule,
    LayerListModule,
    LegendModule,
    TestingModule,
    UITamuBrandingModule,
    AggiemapNgxPopupsModule,
    AggiemapSidebarModule,
    AggiemapNgxUiMobileModule,
    MapComponent
]
})
export class MapModule {}
