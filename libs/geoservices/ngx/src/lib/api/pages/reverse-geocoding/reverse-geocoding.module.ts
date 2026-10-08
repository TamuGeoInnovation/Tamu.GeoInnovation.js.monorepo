import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { ClipboardCopyDirective, CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

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

import { ReverseGeocodingComponent } from './reverse-geocoding.component';

const routes: Routes = [
  {
    path: '',
    component: ReverseGeocodingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HighlightPlusModule,
    ClipboardCopyDirective,
    CopyComponent,
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
    ReverseGeocodingComponent
  ]
})
export class ReverseGeocodingModule {}
