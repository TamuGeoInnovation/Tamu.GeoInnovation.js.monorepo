import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

import { SubmissionComponent } from './components/submission.component';
import { SubmissionCompleteComponent } from './components/complete/complete.component';

const routes: Routes = [
  {
    path: '',
    component: SubmissionComponent
  },
  {
    path: 'complete',
    component: SubmissionCompleteComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
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
    SubmissionComponent,
    SubmissionCompleteComponent
  ],
  exports: [SubmissionComponent]
})
export class SubmissionModule {}
