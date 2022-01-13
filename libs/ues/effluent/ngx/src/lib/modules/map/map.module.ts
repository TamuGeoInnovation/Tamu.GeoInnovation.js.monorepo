import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {
  AggiemapModule,
  AggiemapMobileUIModule,
  MobileUIComponent,
  OmnisearchComponent,
  AggiemapCoreUIModule,
  AggiemapSidebarModule,
  MainMobileSidebarComponent,
  MobileSidebarComponent,
  AggiemapFormsModule
} from '@tamu-gisc/aggiemap';
import { AggiemapNgxPopupsModule } from '@tamu-gisc/aggiemap/ngx/popups';
import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import { MapsFeatureTripPlannerModule } from '@tamu-gisc/maps/feature/trip-planner';
import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';

import { SidebarOverviewComponent } from '../sidebar/components/sidebar-overview/sidebar-overview.component';
import { SidebarReferenceComponent } from '../sidebar/components/sidebar-reference/sidebar-reference.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MapComponent } from './map.component';
import { SidebarRelationshipsComponent } from '../sidebar/components/sidebar-relationships/sidebar-relationships.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
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
          { path: 'relationships', component: SidebarRelationshipsComponent },
          { path: 'overview', component: SidebarOverviewComponent }
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
    AggiemapNgxPopupsModule,
    MapsFeatureAccessibilityModule,
    MapsFeatureCoordinatesModule,
    UIClipboardModule,
    UIDragModule,
    UILayoutModule,
    UIFormsModule,
    PipesModule,
    SearchModule,
    AggiemapMobileUIModule,
    AggiemapCoreUIModule,
    AggiemapSidebarModule,
    AggiemapFormsModule,
    SettingsModule,
    SidebarModule,
    UITamuBrandingModule,
    UESCoreUIModule
  ],
  declarations: [MapComponent],
  providers: []
})
export class MapModule {}
