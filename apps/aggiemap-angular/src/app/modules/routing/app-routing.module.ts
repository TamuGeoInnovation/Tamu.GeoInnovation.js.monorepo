import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';
import { DlDateTimePickerDateModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';

import { DesktopGuard, MobileGuard } from '@tamu-gisc/common/utils/device/guards';

// Modules
import {
  AggiemapModule,
  AggiemapSidebarComponent,
  BusListComponent,
  SidebarTripPlannerComponent,
  SidebarReferenceComponent,
  AggiemapMobileUIModule,
  MobileUIComponent,
  TripPlannerTopComponent,
  OmnisearchComponent,
  TripPlannerBottomComponent,
  AggiemapCoreUIModule,
  AggiemapSidebarModule,
  MainMobileSidebarComponent,
  MobileSidebarComponent,
  ModalComponent,
  ReportBadRouteComponent,
  AggiemapFormsModule
} from '@tamu-gisc/aggiemap';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIDragModule } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UIStructuralLayoutModule } from '@tamu-gisc/ui-kits/ngx/layout/structural';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import { MapsFeatureTripPlannerModule, TripPlannerOptionsComponent } from '@tamu-gisc/maps/feature/trip-planner';
import { MapPopupModule, PopupMobileComponent } from '@tamu-gisc/maps/feature/popup';
import { PopupsModule } from '@tamu-gisc/aggiemap';
import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';

// Components
import { EsriMapComponent } from '../../map/esri-map.component';

WebFont.load({
  google: {
    families: ['Material Icons']
  },
  custom: {
    families: ['Moriston', 'Tungsten'],
    urls: ['assets/fonts/moriston_pro/moriston_pro.css', 'assets/fonts/tungsten/tungsten.css']
  }
});

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    component: EsriMapComponent,
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
          { path: 'bus', component: BusListComponent },
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
  },
  { path: 'about', loadChildren: () => import('../../about/about.module').then((m) => m.AboutModule) },
  { path: 'changelog', loadChildren: () => import('../../changelog/changelog.module').then((m) => m.ChangelogModule) },
  { path: 'directory', loadChildren: () => import('../../directory/directory.module').then((m) => m.DirectoryModule) },
  { path: 'feedback', loadChildren: () => import('../../feedback/feedback.module').then((m) => m.FeedbackModule) },
  { path: 'privacy', loadChildren: () => import('../../privacy/privacy.module').then((m) => m.PrivacyModule) },
  {
    path: 'instructions',
    loadChildren: () => import('../../instructions/instructions.module').then((m) => m.InstructionsModule)
  },
  {
    path: '**',
    redirectTo: 'map'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(hybridRoutes),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
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
    UIStructuralLayoutModule,
    UIClipboardModule,
    MapsFeatureTripPlannerModule,
    MapPopupModule,
    PopupsModule,
    AggiemapModule,
    AggiemapCoreUIModule,
    AggiemapSidebarModule,
    AggiemapMobileUIModule,
    MapsFeatureCoordinatesModule,
    AggiemapFormsModule
  ],
  declarations: [EsriMapComponent],
  exports: [RouterModule]
})
export class AppRoutingModule {}
