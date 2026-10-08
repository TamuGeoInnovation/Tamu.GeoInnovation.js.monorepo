import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

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

import { OrganizationsComponent } from './organizations.component';
import { OrganizationListComponent } from './pages/organization-list/organization-list.component';
import { OrganizationAddComponent } from './pages/organization-add/organization-add.component';
import { OrganizationEditComponent } from './pages/organization-edit/organization-edit.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    children: [
      {
        path: '',
        component: OrganizationListComponent
      },
      {
        path: 'add',
        component: OrganizationAddComponent
      },
      {
        path: 'edit/:guid',
        component: OrganizationEditComponent
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
    OrganizationsComponent,
    OrganizationListComponent,
    OrganizationAddComponent,
    OrganizationEditComponent
  ]
})
export class OrganizationsModule {}
