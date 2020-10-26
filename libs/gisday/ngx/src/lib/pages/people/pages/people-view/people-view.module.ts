import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PeopleViewComponent } from './people-view.component';

const routes: Routes = [
  {
    path: '',
    component: PeopleViewComponent
  }
];

@NgModule({
  declarations: [PeopleViewComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeopleViewModule {}
