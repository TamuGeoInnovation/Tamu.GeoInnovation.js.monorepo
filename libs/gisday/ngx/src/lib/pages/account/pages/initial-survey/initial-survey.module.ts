import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { InitialSurveyComponent } from './initial-survey.component';
import { BinaryQuestionComponent } from './components/binary-question/binary-question.component';
import { TextQuestionComponent } from './components/text-question/text-question.component';
import { ScaleNormalQuestionComponent } from './components/scale-normal-question/scale-normal-question.component';
import { MultipleOptionQuestionComponent } from './components/multiple-option-question/multiple-option-question.component';

const routes: Routes = [
  {
    path: '',
    component: InitialSurveyComponent
  }
];

@NgModule({
  declarations: [InitialSurveyComponent, BinaryQuestionComponent, TextQuestionComponent, ScaleNormalQuestionComponent, MultipleOptionQuestionComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class InitialSurveyModule {}
