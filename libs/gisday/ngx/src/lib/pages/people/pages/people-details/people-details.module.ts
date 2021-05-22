import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PeopleDetailsComponent } from './people-details.component';

const routes: Routes = [
  {
    path: '',
    component: PeopleDetailsComponent
  }
];

@NgModule({
  declarations: [PeopleDetailsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeopleDetailsModule {}
