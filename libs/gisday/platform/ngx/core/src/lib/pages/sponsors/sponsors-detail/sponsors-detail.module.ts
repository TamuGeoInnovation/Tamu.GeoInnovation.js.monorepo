import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

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
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';
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

import { SponsorsDetailComponent } from './sponsors-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsDetailComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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
    GisdayPlatformNgxCommonModule,
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
    SponsorsDetailComponent
  ],
  exports: [RouterModule]
})
export class SponsorsDetailModule {}
