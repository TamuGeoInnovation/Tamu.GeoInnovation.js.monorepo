import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CPAFormsModule } from '../forms/cpaForms.module';
import { ScenarioBuilderComponent } from '../forms/components/scenario-builder/scenario-builder.component';

import { CreateComponent } from './create.component';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent,
    children: [
      {
        path: '',
        component: ScenarioBuilderComponent
      },
      {
        path: ':guid',
        component: ScenarioBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, CPAFormsModule],
  declarations: [CreateComponent],
  exports: [RouterModule]
})
export class CpaCreateModule {}
