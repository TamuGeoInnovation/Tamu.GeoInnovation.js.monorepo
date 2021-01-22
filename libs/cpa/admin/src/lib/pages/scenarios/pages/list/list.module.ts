import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list.component';
import { ScenarioCommonModule } from '../../common/common.module';
import { ScenarioListComponent } from '../../common/components/scenario-list/scenario-list.component';
import { ScenarioBuilderComponent } from '../../common/components/scenario-builder/scenario-builder.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ScenarioListComponent,
      },
      {
        path: 'create',
        component: ScenarioBuilderComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [ListComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ScenarioCommonModule],
})
export class ScenarioListModule {}
