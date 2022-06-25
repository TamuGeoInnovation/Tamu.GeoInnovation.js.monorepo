import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {
  ModalComponent,
  ReportBadRouteComponent,
  AggiemapFormsModule,
  AggiemapNgxSharedUiStructuralModule,
  TransportationModule,
  BusListComponent
} from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { SidebarTripPlannerComponent, AggiemapSidebarModule } from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import {
  AggiemapNgxUiMobileModule,
  AggiemapNgxUiMobileComponent,
  TripPlannerBottomComponent,
  TripPlannerTopComponent,
  MainMobileSidebarComponent,
  MobileSidebarComponent,
  OmnisearchComponent
} from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';
import { EsriMapModule, EsriModuleProviderService, EsriMapService } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListCategorizedComponent } from '@tamu-gisc/maps/feature/layer-list';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import {
  MapsFeatureTripPlannerModule,
  TripPlannerOptionsComponent,
  TripPlannerService,
  BusService
} from '@tamu-gisc/maps/feature/trip-planner';
import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    MapsFeatureTripPlannerModule,
    LegendModule,
    LayerListModule,
    MapPopupModule,
    AggiemapNgxPopupsModule,
    MapsFeatureAccessibilityModule,
    MapsFeatureCoordinatesModule,
    UIClipboardModule,
    UIDragModule,
    UILayoutModule,
    UIFormsModule,
    PipesModule,
    SearchModule,
    AggiemapNgxUiMobileModule,
    AggiemapNgxSharedUiStructuralModule,
    AggiemapSidebarModule,
    AggiemapFormsModule,
    SettingsModule,
    SidebarModule,
    UITamuBrandingModule,
    UESCoreUIModule,
    TransportationModule
  ],
  declarations: [MapComponent],
  providers: [EsriModuleProviderService, EsriMapService, TripPlannerService, BusService]
})
export class MapModule {}
