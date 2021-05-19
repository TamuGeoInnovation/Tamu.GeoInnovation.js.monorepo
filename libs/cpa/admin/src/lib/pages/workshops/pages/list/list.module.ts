import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list.component';
import { WorkshopsCommonModule } from '../../common/common.module';
import { WorkshopsListComponent } from '../../common/components/workshops-list/workshops-list.component';
import { WorkshopBuilderComponent } from '../../common/components/workshop-builder/workshop-builder.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WorkshopsListComponent
      },
      {
        path: 'create',
        component: WorkshopBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), WorkshopsCommonModule],
  declarations: [ListComponent]
})
export class WorkshopListModule {}
