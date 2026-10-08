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

import { AdminUniversityComponent } from './admin-university.component';
import { UniversityEditComponent } from './pages/university-edit/university-edit.component';
import { UniversityAddComponent } from './pages/university-add/university-add.component';
import { UniversityListComponent } from './pages/university-list/university-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminUniversityComponent,
    children: [
      {
        path: 'edit/:guid',
        component: UniversityEditComponent
      },
      {
        path: 'add',
        component: UniversityAddComponent
      },
      {
        path: '',
        component: UniversityListComponent
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
    AdminUniversityComponent,
    UniversityEditComponent,
    UniversityAddComponent,
    UniversityListComponent
  ],
  exports: [RouterModule]
})
export class AdminUniversityModule {}
