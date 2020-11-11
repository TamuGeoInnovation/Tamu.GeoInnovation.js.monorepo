import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WorkshopsListComponent } from './workshops-list.component';

const routes: Routes = [
  {
    path: '',
    component: WorkshopsListComponent,
    data: {
      title: 'Workshops'
    }
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [WorkshopsListComponent]
})
export class WorkshopsListModule {}
