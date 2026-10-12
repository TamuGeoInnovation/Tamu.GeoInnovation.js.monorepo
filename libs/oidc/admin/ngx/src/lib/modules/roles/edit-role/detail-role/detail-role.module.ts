import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

import { DetailRoleComponent } from './detail-role.component';

const routes: Routes = [
  {
    path: '',
    component: DetailRoleComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
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
  ],
  declarations: [DetailRoleComponent],
  exports: [RouterModule]
})
export class DetailRoleModule {}
