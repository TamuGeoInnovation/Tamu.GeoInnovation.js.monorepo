import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminTestingSitesComponent } from './admin-testing-sites.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTestingSitesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminTestingSitesComponent]
})
export class AdminTestingSitesModule {}
