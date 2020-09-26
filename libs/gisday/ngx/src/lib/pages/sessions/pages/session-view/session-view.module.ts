import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SessionViewComponent } from './session-view.component';

const routes: Routes = [
  {
    path: '',
    component: SessionViewComponent
  }
];

@NgModule({
  declarations: [SessionViewComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionViewModule {}
