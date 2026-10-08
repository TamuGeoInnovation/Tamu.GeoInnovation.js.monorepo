import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import {
  ModalComponent,
  ReportBadRouteComponent,
  BackdropComponent,
  HeaderComponent,
  FooterComponent,
  BusListComponent,
  BusListHeaderComponent,
  BusRouteComponent,
  BusTimetableComponent
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
import { EsriModuleProviderService, EsriMapService, EsriMapComponent } from '@tamu-gisc/maps/esri';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';
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
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
// The shared sidebar's component, renamed here because UES has a SidebarComponent of its own.
import { SidebarComponent as SidebarContainerComponent, SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule, LayerListCategorizedComponent } from '@tamu-gisc/maps/feature/layer-list';
import { MapViewfinderComponent } from '@tamu-gisc/maps/feature/accessibility';
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
  TripPlannerService,
  BusService,
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
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

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
    EsriMapComponent,
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
    LegendModule,
    LayerListModule,
    PopupComponent,
    PopupMobileComponent,
    RevealSidebarOnPopupDirective,
    AggiemapNgxPopupsModule,
    MapViewfinderComponent,
    ClickCoordinatesComponent,
    ClipboardCopyDirective,
    CopyComponent,
    DragDirective,
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
    SearchComponent,
    SearchMobileComponent,
    SearchResultPipe,
    AggiemapNgxUiMobileModule,
    BackdropComponent,
    ModalComponent,
    HeaderComponent,
    FooterComponent,
    AggiemapSidebarModule,
    ReportBadRouteComponent,
    SettingsModule,
    SidebarContainerComponent,
    SidebarTabComponent,
    UITamuBrandingModule,
    BusListComponent,
    BusListHeaderComponent,
    BusRouteComponent,
    BusTimetableComponent,
    MapComponent
  ],
  providers: [EsriModuleProviderService, EsriMapService, TripPlannerService, BusService]
})
export class MapModule {}
