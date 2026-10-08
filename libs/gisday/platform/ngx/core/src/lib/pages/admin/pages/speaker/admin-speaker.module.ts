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

import { AdminSpeakerComponent } from './admin-speaker.component';
import { SpeakerListComponent } from './pages/speaker-list/speaker-list.component';
import { SpeakerAddComponent } from './pages/speaker-add/speaker-add.component';
import { SpeakerEditComponent } from './pages/speaker-edit/speaker-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSpeakerComponent,
    children: [
      {
        path: 'edit/:guid',
        component: SpeakerEditComponent
      },
      {
        path: 'add',
        component: SpeakerAddComponent
      },
      {
        path: '',
        component: SpeakerListComponent
      }
    ]
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
    AdminSpeakerComponent,
    SpeakerListComponent,
    SpeakerAddComponent,
    SpeakerEditComponent
  ],
  exports: [RouterModule]
})
export class AdminSpeakerModule {}
