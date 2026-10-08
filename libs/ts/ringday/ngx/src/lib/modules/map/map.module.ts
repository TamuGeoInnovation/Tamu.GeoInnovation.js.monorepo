import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {
  ModalComponent,
  ReportBadRouteComponent,
  ReportBadRouteComponent,
  BackdropComponent,
  HeaderComponent,
  FooterComponent
} from '@tamu-gisc/aggiemap/ngx/ui/shared';
import {
  AggiemapSidebarModule,
  SidebarSettingsComponent,
  SidebarTripPlannerComponent
} from '@tamu-gisc/aggiemap/ngx/ui/desktop';
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

import { EsriMapComponent } from '@tamu-gisc/maps/esri';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';

import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import {
  SelectComponent,
  CheckboxComponent,
  CheckboxGroupComponent,
  DateTimePickerComponent,
  TextboxComponent,
  AutocompleteComponent,
  AutocompleteOptionTemplateDirective,
  ButtonComponent,
  FileComponent,
  RadioGroupComponent,
  RangeComponent,
  SlideToggleComponent,
  SelectListComponent,
  TurnstileChallengeComponent
} from '@tamu-gisc/ui-kits/ngx/forms';
import {
  DrawerComponent,
  AccordionComponent,
  AccordionHeaderComponent,
  AccordionContentComponent,
  TooltipComponent,
  TooltipTriggerComponent,
  TabsComponent,
  TabComponent,
  AccordionDirective,
  AccordionHeaderDirective,
  AccordionContentDirective,
  StepperComponent,
  StepComponent,
  StepToggleComponent,
  StepperToggleDirective,
  RenderHostDirective,
  ElementInsertDirective
} from '@tamu-gisc/ui-kits/ngx/layout';
import { DragDirective } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { SidebarComponent, SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import {
  GroupByPipe,
  OrderByPipe,
  MarkdownParsePipe,
  SafeHtmlPipe,
  TimeUntilPipe,
  PhoneNumberFormatPipe,
  ExistsPipe,
  LookupPipe,
  DateRangePipe,
  NearestDatePipe,
  ToDatePipe,
  ToArrayPipe,
  TrimPipe
} from '@tamu-gisc/common/ngx/pipes';
import { LegendModule, LegendComponent } from '@tamu-gisc/maps/feature/legend';
import {
  TripPlannerOptionsComponent,
  TripPlannerConnectionsSelectComponent,
  TripPlannerDirectionsComponent,
  TripPlannerDirectionsMobileComponent,
  TripPlannerDirectionsActionsComponent,
  TripPlannerDirectionsActionsMobileComponent,
  TripPlannerModePickerComponent,
  TripPlannerModePickerMobileComponent,
  TripPlannerModeSwitchComponent,
  TripPlannerBusModeSwitchComponent,
  TripPlannerModeToggleComponent,
  TripPlannerOptionsBaseComponent,
  TripPlannerBikingOptionsComponent,
  TripPlannerParkingOptionsComponent,
  TripPlannerTimePickerComponent,
  RouteDirectionTransformerPipe
} from '@tamu-gisc/maps/feature/trip-planner';
import { PopupMobileComponent, PopupComponent, RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';
import { ClipboardCopyDirective, CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { ClickCoordinatesComponent } from '@tamu-gisc/maps/feature/coordinates';
import { MapViewfinderComponent } from '@tamu-gisc/maps/feature/accessibility';
import { BasemapGalleryComponent } from '@tamu-gisc/maps/feature/basemap';

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
          { path: 'trip/options', component: TripPlannerOptionsComponent },
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
              { path: 'legend', component: LegendComponent },
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UITamuBrandingModule,
    AggiemapNgxUiMobileModule,
    TripPlannerConnectionsSelectComponent,
    TripPlannerDirectionsComponent,
    TripPlannerDirectionsMobileComponent,
    TripPlannerDirectionsActionsComponent,
    TripPlannerDirectionsActionsMobileComponent,
    TripPlannerModePickerComponent,
    TripPlannerModePickerMobileComponent,
    TripPlannerModeSwitchComponent,
    TripPlannerBusModeSwitchComponent,
    TripPlannerModeToggleComponent,
    TripPlannerOptionsBaseComponent,
    TripPlannerBikingOptionsComponent,
    TripPlannerParkingOptionsComponent,
    TripPlannerOptionsComponent,
    TripPlannerTimePickerComponent,
    RouteDirectionTransformerPipe,
    EsriMapComponent,
    ClickCoordinatesComponent,
    MapViewfinderComponent,
    SearchComponent,
    SearchMobileComponent,
    SearchResultPipe,
    BackdropComponent,
    ModalComponent,
    HeaderComponent,
    FooterComponent,
    ReportBadRouteComponent,
    AggiemapSidebarModule,
    CommonNgxRouterModule,
    SelectComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    DateTimePickerComponent,
    TextboxComponent,
    AutocompleteComponent,
    AutocompleteOptionTemplateDirective,
    ButtonComponent,
    FileComponent,
    RadioGroupComponent,
    RangeComponent,
    SlideToggleComponent,
    SelectListComponent,
    TurnstileChallengeComponent,
    DrawerComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    TabsComponent,
    TabComponent,
    AccordionDirective,
    AccordionHeaderDirective,
    AccordionContentDirective,
    StepperComponent,
    StepComponent,
    StepToggleComponent,
    StepperToggleDirective,
    RenderHostDirective,
    ElementInsertDirective,
    DragDirective,
    SettingsModule,
    SidebarComponent,
    SidebarTabComponent,
    LayerListModule,
    GroupByPipe,
    OrderByPipe,
    MarkdownParsePipe,
    SafeHtmlPipe,
    TimeUntilPipe,
    PhoneNumberFormatPipe,
    ExistsPipe,
    LookupPipe,
    DateRangePipe,
    NearestDatePipe,
    ToDatePipe,
    ToArrayPipe,
    TrimPipe,
    LegendModule,
    PopupComponent,
    PopupMobileComponent,
    RevealSidebarOnPopupDirective,
    ClipboardCopyDirective,
    CopyComponent,
    MoveInOutSidebarModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
