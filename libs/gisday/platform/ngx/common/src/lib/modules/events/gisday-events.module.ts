import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

import { SeasonDayCardComponent } from './components/season-day-card/season-day-card.component';
import { EventRowComponent } from './components/event-row/event-row.component';
import { GisdayPlatformNgxCommonModule } from '../../gisday-platform-ngx-common.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
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
    GisdayPlatformNgxCommonModule,
    SeasonDayCardComponent,
    EventRowComponent
  ],
  exports: [SeasonDayCardComponent, EventRowComponent]
})
export class GisDayEventsModule {}
