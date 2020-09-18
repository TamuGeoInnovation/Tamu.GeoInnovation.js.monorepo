import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SessionsComponent } from './sessions.component';

const routes: Routes = [
  {
    path: '',
    component: SessionsComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [SessionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsModule {}
