import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PapersComponent } from './papers.component';

const routes: Routes = [
  {
    path: '',
    component: PapersComponent
  }
];

@NgModule({
  declarations: [PapersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PapersModule {}
