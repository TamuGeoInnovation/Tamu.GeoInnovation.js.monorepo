import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SessionDetailComponent } from './session-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SessionDetailComponent
  }
];

@NgModule({
  declarations: [SessionDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionDetailModule {}
