import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AdminDetailUniversityComponent } from './admin-detail-university.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailUniversityComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [AdminDetailUniversityComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule],
  exports: [RouterModule]
})
export class AdminDetailUniversityModule {}
