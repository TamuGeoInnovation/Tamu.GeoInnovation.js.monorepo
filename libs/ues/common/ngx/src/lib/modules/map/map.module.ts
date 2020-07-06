import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import {
  AggiemapModule,
  AggiemapSidebarComponent,
  SidebarTripPlannerComponent,
  SidebarReferenceComponent
} from '@tamu-gisc/aggiemap';
import { MapsFeatureTripPlannerModule, TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import { LayerListModule, LayerListCategorizedComponent } from '@tamu-gisc/maps/feature/layer-list';
import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';

import { UIStructuralLayoutModule } from '@tamu-gisc/ui-kits/ngx/layout/structural';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

import { SearchModule } from '@tamu-gisc/search';

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
          { path: 'trip', component: SidebarTripPlannerComponent },
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
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    AggiemapModule,
    MapsFeatureTripPlannerModule,
    LegendModule,
    LayerListModule,
    MapPopupModule,
    MapsFeatureAccessibilityModule,
    MapsFeatureCoordinatesModule,
    UIStructuralLayoutModule,
    UIClipboardModule,
    UIDragModule,
    UILayoutModule,
    UIFormsModule,
    PipesModule,
    SearchModule
  ],
  declarations: []
})
export class MapModule {}
