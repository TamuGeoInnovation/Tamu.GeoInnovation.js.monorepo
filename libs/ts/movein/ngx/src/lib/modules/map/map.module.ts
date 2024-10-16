import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {
  AggiemapNgxSharedUiStructuralModule,
  ModalComponent,
  ReportBadRouteComponent,
  AggiemapFormsModule
} from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { AggiemapSidebarModule, SidebarTripPlannerComponent } from '@tamu-gisc/aggiemap/ngx/ui/desktop';
import {
  AggiemapNgxUiMobileModule,
  OmnisearchComponent,
  TripPlannerBottomComponent,
  TripPlannerTopComponent,
  MobileSidebarComponent,
  MainMobileSidebarComponent,
  AggiemapNgxUiMobileComponent
} from '@tamu-gisc/aggiemap/ngx/ui/mobile';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import { MapsFeatureTripPlannerModule, TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';

import { MoveInOutSidebarModule } from '../sidebar/sidebar.module';
import { MapComponent } from './map.component';
import { MoveInOutSidebarComponent } from '../sidebar/sidebar.component';
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
        component: MoveInOutSidebarComponent,
        canActivateChild: [DesktopGuard],
        children: [
          { path: '', component: SidebarReferenceComponent },
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
              { path: 'legend', component: LegendComponent, data: { staticElementsPosition: 'bottom' } },
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
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UITamuBrandingModule,
    AggiemapNgxUiMobileModule,
    MapsFeatureTripPlannerModule,
    EsriMapModule,
    MapsFeatureCoordinatesModule,
    MapsFeatureAccessibilityModule,
    SearchModule,
    AggiemapNgxSharedUiStructuralModule,
    AggiemapFormsModule,
    AggiemapSidebarModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    UIFormsModule,
    UILayoutModule,
    UIDragModule,
    SettingsModule,
    SidebarModule,
    LayerListModule,
    PipesModule,
    LegendModule,
    MapPopupModule,
    UIClipboardModule,
    MoveInOutSidebarModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
