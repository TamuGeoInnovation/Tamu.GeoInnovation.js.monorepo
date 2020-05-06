import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AdminTestingSitesComponent } from './admin-testing-sites.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTestingSitesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, UIFormsModule],
  declarations: [AdminTestingSitesComponent]
})
export class AdminTestingSitesModule {}
