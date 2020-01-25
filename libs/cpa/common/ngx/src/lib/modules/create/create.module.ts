import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CPAFormsModule } from '../forms/cpaForms.module';
import { ScenarioBuilderComponent } from '../forms/components/scenario-builder/scenario-builder.component';

import { CreateComponent } from './create.component';
import { OverviewComponent } from './components/overview/overview.component';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent,
    children: [
      {
        path: '',
        component: OverviewComponent
      },
      {
        path: 'scenarios',
        component: ScenarioBuilderComponent
      },
      {
        path: 'scenarios/:guid',
        component: ScenarioBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, CPAFormsModule],
  declarations: [CreateComponent, OverviewComponent],
  exports: [RouterModule]
})
export class CpaCreateModule {}
