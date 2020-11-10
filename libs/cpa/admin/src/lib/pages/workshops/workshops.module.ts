import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WorkshopsComponent } from './workshops.component';

const routes: Routes = [
  {
    path: '',
    component: WorkshopsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [WorkshopsComponent]
})
export class WorkshopsModule {}
