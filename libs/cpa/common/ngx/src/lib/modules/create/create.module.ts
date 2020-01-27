import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CPAFormsModule } from '../forms/cpaForms.module';
import { ScenarioBuilderComponent } from '../forms/components/scenario-builder/scenario-builder.component';

import { CreateComponent } from './create.component';
import { OverviewComponent } from './components/overview/overview.component';
import { WorkshopListComponent } from './components/workshop-list/workshop-list.component';
import { WorkshopBuilderComponent } from '../forms/components/workshop-builder/workshop-builder.component';
import { ScenariosListComponent } from './components/scenarios-list/scenarios-list.component';

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
        path: 'workshops',
        component: WorkshopListComponent
      },
      {
        path: 'workshops/create',
        component: WorkshopBuilderComponent
      },
      {
        path: 'workshops/edit/:guid',
        component: WorkshopBuilderComponent
      },
      {
        path: 'scenarios',
        component: ScenariosListComponent
      },
      {
        path: 'scenarios/create',
        component: ScenarioBuilderComponent
      },
      {
        path: 'scenarios/edit/:guid',
        component: ScenarioBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, CPAFormsModule],
  declarations: [CreateComponent, OverviewComponent, WorkshopListComponent, ScenariosListComponent],
  exports: [RouterModule]
})
export class CpaCreateModule {}
