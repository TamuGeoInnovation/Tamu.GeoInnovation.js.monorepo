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

import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
        data: {
          breadcrumb: 'Home'
        }
      },
      {
        path: 'workshops',
        component: WorkshopListComponent,
        data: {
          breadcrumb: 'Workshops'
        }
      },
      {
        path: 'workshops/create',
        component: WorkshopBuilderComponent,
        data: {
          breadcrumb: 'New'
        }
      },
      {
        path: 'workshops/edit/:guid',
        component: WorkshopBuilderComponent,
        data: {
          breadcrumb: 'Edit'
        }
      },
      {
        path: 'scenarios',
        component: ScenariosListComponent,
        data: {
          breadcrumb: 'Scenarios'
        }
      },
      {
        path: 'scenarios/create',
        component: ScenarioBuilderComponent,
        data: {
          breadcrumb: 'New'
        }
      },
      {
        path: 'scenarios/edit/:guid',
        component: ScenarioBuilderComponent,
        data: {
          breadcrumb: 'Edit'
        }
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, CPAFormsModule, NavigationBreadcrumbModule],
  declarations: [CreateComponent, OverviewComponent, WorkshopListComponent, ScenariosListComponent],
  exports: [RouterModule]
})
export class CpaCreateModule {}
