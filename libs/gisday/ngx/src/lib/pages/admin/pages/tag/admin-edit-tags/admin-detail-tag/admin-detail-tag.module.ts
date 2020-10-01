import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AdminDetailTagComponent } from './admin-detail-tag.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailTagComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [AdminDetailTagComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, UIFormsModule],
  exports: [RouterModule]
})
export class AdminDetailTagModule {}
