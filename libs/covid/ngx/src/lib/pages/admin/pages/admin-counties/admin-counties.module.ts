import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminCountiesComponent } from './admin-counties.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCountiesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminCountiesComponent]
})
export class AdminCountiesModule {}
